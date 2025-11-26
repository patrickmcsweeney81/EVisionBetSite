# BET EVision Platform - Project Plan

## Project Overview

**Name:** BET EVision Platform  
**Type:** Sports Betting Analytics SaaS  
**Target Market:** Sports bettors looking for Expected Value (EV) opportunities  
**Competitors:** BonusBank, OddsJam, Unabated, Action Network

## Vision

Create a professional, user-friendly platform that helps sports bettors find and track profitable betting opportunities by comparing odds across bookmakers and identifying positive Expected Value bets.

## Goals

### Short-term (3 months)
- ✅ Deploy basic web infrastructure
- [ ] Integrate existing Python EV bot with web platform
- [ ] Build odds comparison table UI (like BonusBank)
- [ ] Implement user authentication and preferences
- [ ] Launch MVP to beta users

### Medium-term (6 months)
- [ ] Add real-time odds updates via WebSocket
- [ ] Implement bet tracking and ROI analytics
- [ ] Add email/SMS alerts for high EV opportunities
- [ ] Support 5+ sports and 10+ bookmakers
- [ ] Reach 100 active users

### Long-term (12 months)
- [ ] Launch mobile apps (iOS/Android)
- [ ] Add arbitrage detection
- [ ] Player props and live betting EV
- [ ] Subscription tiers (Free/Pro/Enterprise)
- [ ] Reach 1,000+ paying subscribers

## Success Metrics

- **User Acquisition:** 1,000 users in first year
- **User Engagement:** 50% weekly active users
- **Conversion Rate:** 10% free → paid conversion
- **ROI for Users:** Avg 5%+ ROI for premium users
- **Revenue:** $10k MRR by end of year 1

## Target Audience

### Primary
- **Sports Bettors** (18-45, male-dominant)
- **Experience Level:** Intermediate to advanced
- **Pain Point:** Manually comparing odds is time-consuming
- **Value Prop:** Save time, find more EV opportunities

### Secondary
- **Professional Bettors** (syndicates, high-volume)
- **Sports Betting Content Creators** (need data for content)
- **Betting Software Developers** (want API access)

## Revenue Model

### Freemium SaaS
- **Free Tier:** Limited bookmakers (3), basic EV (H2H only)
- **Pro Tier ($29/mo):** All bookmakers, all markets, alerts
- **Enterprise ($99/mo):** API access, custom integrations, priority support

### Alternative Revenue
- **Affiliate Commissions:** Bookmaker sign-up bonuses
- **White-Label:** Sell platform to media companies
- **Data API:** Sell odds/EV data feed

## Competitive Advantage

1. **Focus on Australian Market:** Most competitors US-focused
2. **Clean UI/UX:** Simpler than competitors
3. **Affordable Pricing:** Undercut OddsJam ($99/mo)
4. **Fast Development:** Existing Python bot code ready
5. **Transparency:** Open about methodology

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| API costs too high | High | Start with limited free tier, charge early |
| Bookmaker bans users | Medium | Educate users on staying under radar |
| Competitor price war | Medium | Focus on value, not just price |
| Regulatory changes | High | Monitor laws, pivot to legal markets |
| Technical scaling | Low | Cloud infrastructure scales easily |

## Development Phases

### Phase 0: Foundation (✅ Complete)
- Basic web infrastructure
- Deployment pipeline
- Custom domain setup

### Phase 1: Bot Integration (Current)
- Migrate backend to Python FastAPI
- Integrate existing EV bot code
- Set up database and caching
- Create API endpoints for odds/EV data

### Phase 2: Core Features (Next 6 weeks)
- Odds comparison table UI
- Real-time updates (WebSocket)
- User authentication & registration
- Bookmaker preferences
- Basic analytics dashboard

### Phase 3: Advanced Features (Weeks 7-12)
- Bet tracking and history
- Email/SMS alerts
- ROI analytics and charts
- Export functionality
- Mobile responsiveness

### Phase 4: Growth Features (Weeks 13-20)
- Subscription payments (Stripe)
- Arbitrage detection
- Player props support
- API for developers
- Referral program

### Phase 5: Scale & Optimize (Weeks 21+)
- Performance optimization
- Mobile apps (React Native)
- International expansion
- Premium features
- Community features

## Team & Resources

### Current
- **Developer:** You (full-stack + Python)
- **Tools:** GitHub Copilot for AI assistance
- **Budget:** Minimal (free tiers + domain cost)

### Future Needs
- **Designer:** UI/UX improvements (contract basis)
- **Marketing:** SEO, content, social media
- **Customer Support:** Help desk (shared inbox first)
- **Legal:** Terms of service, privacy policy

## Timeline

```
Month 1-2:  Bot integration, database setup
Month 3:    MVP launch to beta users
Month 4:    Feedback iteration, feature polish
Month 5:    Public launch, marketing push
Month 6:    Advanced features, growth focus
Month 7-12: Scale, optimize, expand markets
```

## Budget Estimate (Year 1)

### Infrastructure
- Render backend: $20/mo → $240/year
- Netlify frontend: $0 (free tier)
- PostgreSQL: $25/mo → $300/year
- Redis: $10/mo → $120/year
- The Odds API: $200/mo → $2,400/year
- Domain/SSL: $50/year
- **Total Infrastructure:** ~$3,100/year

### Services
- Email (SendGrid): $15/mo → $180/year
- SMS (Twilio): $20/mo → $240/year
- Monitoring (Sentry): $0 (free tier)
- **Total Services:** ~$420/year

### Marketing
- Content creation: $500/mo → $6,000/year
- Paid ads (optional): $1,000/mo → $12,000/year
- **Total Marketing:** $6,000-$18,000/year

### Total Year 1 Budget: $10,000-$22,000

## Success Roadmap

**Month 3:** 100 beta users, gather feedback  
**Month 6:** 500 users, 50 paying ($29/mo) = $1,450 MRR  
**Month 12:** 2,000 users, 200 paying = $5,800 MRR  
**Month 18:** 5,000 users, 500 paying = $14,500 MRR  
**Month 24:** 10,000 users, 1,000 paying = $29,000 MRR  

**Goal:** Profitability by Month 8-10

## Next Actions

1. ✅ Create comprehensive TODO list
2. ✅ Set up project structure
3. [ ] Copy EV bot code to `/bot` directory
4. [ ] Begin Phase 1: Backend migration to FastAPI
5. [ ] Document API endpoints
6. [ ] Design odds comparison table component

See [TODO.md](../TODO.md) for detailed task breakdown.
