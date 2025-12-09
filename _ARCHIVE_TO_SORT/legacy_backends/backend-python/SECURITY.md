# Security Hardening Guide

This document outlines the security measures implemented in the backend and best practices for deployment.

## Implemented Security Features

### 1. Rate Limiting

**Purpose**: Prevent brute force attacks and API abuse.

**Implementation**:
- Token bucket algorithm with configurable limits per endpoint
- Default: 60 requests/minute per IP
- Stricter limits for sensitive endpoints:
  - `/api/auth/login`: 10 requests/minute
  - `/api/auth/register`: 5 requests/minute
  - `/api/auth/refresh`: 20 requests/minute

**Configuration**:
```python
# In main.py
rate_limits = {
    "/api/auth/login": 10,
    "/api/auth/register": 5,
    "default": 60
}
app.add_middleware(RateLimitMiddleware, default_limits=rate_limits)
```

**Response**:
- Status: `429 Too Many Requests`
- Header: `Retry-After: <seconds>`

### 2. Security Headers

**Headers Added**:
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
```

**Purpose**:
- Prevent MIME type sniffing
- Block clickjacking attacks
- Enable XSS protection
- Enforce HTTPS connections
- Control resource loading

### 3. Audit Logging

**Logged Events**:
- Authentication attempts (success/failure)
- User registration
- User deletion
- Password changes
- Administrative actions
- Suspicious activity

**Log Location**: `data/audit.log`

**Format**:
```
2025-01-19 10:30:15 - INFO - AUTH SUCCESS: user=john, ip=192.168.1.1
2025-01-19 10:32:45 - WARNING - AUTH FAILED: user=admin, ip=203.0.113.5, reason=invalid_credentials
```

**Usage in Code**:
```python
from app.security import audit_logger

# Log authentication
audit_logger.log_auth_attempt(username, success=True, ip=request.client.host)

# Log user creation
audit_logger.log_user_creation(username, created_by="admin", ip=request.client.host)

# Log suspicious activity
audit_logger.log_suspicious_activity("multiple_failed_logins", username, ip=client_ip)
```

### 4. Request Logging

**Features**:
- Logs all HTTP requests with method, path, and status code
- Includes processing time in milliseconds
- Adds `X-Process-Time` header to responses

**Format**:
```
2025-01-19 10:30:15 - INFO - Request: GET /api/odds
2025-01-19 10:30:15 - INFO - Response: 200 GET /api/odds (0.234s)
```

### 5. JWT Authentication

**Configuration**:
- Algorithm: `HS256` (configurable)
- Token expiry: 60 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- Secure token generation with secret key

**Best Practices**:
- Store `SECRET_KEY` in environment variable (never in code)
- Use strong, randomly generated secret (min 32 characters)
- Rotate secrets periodically in production

### 6. CORS Configuration

**Settings**:
```python
CORS_ORIGINS = ["http://localhost:3000", "https://yourdomain.com"]
```

**Production Recommendations**:
- Restrict origins to your frontend domain only
- Never use `"*"` in production
- Consider subdomain policies carefully

## Additional Security Recommendations

### 7. Environment Variables

**Critical Variables** (never commit to git):
```env
SECRET_KEY=<strong-random-string-min-32-chars>
DATABASE_URL=<connection-string>
REDIS_URL=<redis-connection>
ODDS_API_KEY=<api-key>
```

**Generate Strong Secret**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 8. HTTPS/TLS

**Deployment**:
- Always use HTTPS in production
- Render.com provides automatic TLS certificates
- Verify `Strict-Transport-Security` header is enabled

**Testing**:
```bash
curl -I https://your-api.onrender.com/health
# Look for: Strict-Transport-Security header
```

### 9. Database Security

**PostgreSQL**:
- Use connection pooling with reasonable limits
- Enable SSL/TLS for database connections
- Restrict database user permissions (principle of least privilege)
- Regular backups

**Connection String**:
```env
DATABASE_URL=postgresql://user:password@host:5432/db?sslmode=require
```

### 10. Dependency Security

**Regular Updates**:
```bash
# Check for vulnerabilities
pip install safety
safety check

# Update dependencies
pip list --outdated
pip install --upgrade <package>
```

**GitHub Dependabot**:
- Enable in repository settings
- Auto-creates PRs for security updates

## Monitoring & Incident Response

### 1. Audit Log Monitoring

**Regular Checks**:
```bash
# View recent failed auth attempts
grep "AUTH FAILED" data/audit.log | tail -20

# Check for suspicious activity
grep "SUSPICIOUS" data/audit.log

# Monitor specific user
grep "user=admin" data/audit.log
```

**Alerting** (future enhancement):
- Set up log aggregation (e.g., ELK stack, Papertrail)
- Alert on multiple failed login attempts
- Alert on suspicious patterns

### 2. Rate Limit Monitoring

**Check via Metrics**:
```bash
curl http://localhost:8000/api/monitoring/metrics | grep rate_limit
```

**Signs of Attack**:
- Spike in 429 responses
- Many requests from single IP
- Unusual traffic patterns

### 3. Health Checks

**Endpoints**:
```bash
# Basic health
curl http://localhost:8000/health

# Detailed health
curl http://localhost:8000/api/monitoring/health

# System stats (requires auth)
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/monitoring/stats
```

## Incident Response

### Suspicious Activity Detected

1. **Review Audit Logs**:
   ```bash
   tail -100 data/audit.log
   ```

2. **Check Active Sessions**:
   ```bash
   curl -H "Authorization: Bearer <admin-token>" \
     http://localhost:8000/api/monitoring/stats
   ```

3. **Block IP** (via reverse proxy/firewall):
   ```nginx
   # In nginx.conf
   deny 203.0.113.5;
   ```

4. **Rotate Secrets**:
   - Generate new `SECRET_KEY`
   - Update in environment
   - Restart application
   - All existing tokens invalidated

### Brute Force Attack

1. **Identify Attack Pattern**:
   ```bash
   grep "AUTH FAILED" data/audit.log | cut -d',' -f2 | sort | uniq -c | sort -rn
   ```

2. **Verify Rate Limiting Active**:
   - Check for 429 responses
   - Verify `Retry-After` headers

3. **Tighten Rate Limits** (if needed):
   ```python
   rate_limits = {
       "/api/auth/login": 5,  # Reduce from 10
       "default": 30          # Reduce from 60
   }
   ```

## Security Checklist for Production

- [ ] **Secrets**: All secrets in environment variables (not in code)
- [ ] **SECRET_KEY**: Strong random string (min 32 characters)
- [ ] **HTTPS**: TLS enabled with valid certificate
- [ ] **CORS**: Restricted to frontend domain only
- [ ] **Database**: SSL connection enabled
- [ ] **Rate Limiting**: Active on all endpoints
- [ ] **Security Headers**: Verified in responses
- [ ] **Audit Logging**: Writing to persistent storage
- [ ] **Dependencies**: No known vulnerabilities (`safety check`)
- [ ] **Monitoring**: Health checks configured
- [ ] **Backups**: Database backup strategy in place
- [ ] **Documentation**: Security policies documented
- [ ] **Incident Response**: Plan defined and tested

## Testing Security

### 1. Test Rate Limiting

```bash
# Send 20 rapid requests (should see 429 after 10)
for i in {1..20}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -d "username=test&password=test" \
    -w "\nStatus: %{http_code}\n"
done
```

### 2. Test Security Headers

```bash
curl -I http://localhost:8000/health
# Verify all security headers present
```

### 3. Test JWT Validation

```bash
# Invalid token
curl -H "Authorization: Bearer invalid" \
  http://localhost:8000/api/auth/me
# Should return 401

# Expired token (test after token expiry)
curl -H "Authorization: Bearer <expired-token>" \
  http://localhost:8000/api/auth/me
# Should return 401
```

### 4. Test CORS

```bash
# From disallowed origin
curl -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS http://localhost:8000/api/odds
# Should reject or not include Access-Control-Allow-Origin
```

## Future Enhancements

1. **Two-Factor Authentication (2FA)**
   - TOTP-based (Google Authenticator, Authy)
   - SMS backup codes

2. **IP Whitelisting**
   - Admin endpoints restricted to specific IPs
   - Configurable IP allowlists

3. **Session Management**
   - Active session tracking
   - Force logout capability
   - Session expiry

4. **Advanced Threat Detection**
   - Anomaly detection in access patterns
   - Automated IP blocking
   - Honeypot endpoints

5. **Compliance**
   - GDPR data export/deletion
   - Data retention policies
   - Privacy audit trails

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [HTTP Security Headers](https://securityheaders.com/)
