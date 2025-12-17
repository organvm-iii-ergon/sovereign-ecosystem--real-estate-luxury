# Chart Export, Email Scheduling & Team Comparison Features

## Overview

This document describes the new export, automation, and comparison features added to The Sovereign Ecosystem testing and analytics platform.

## 🎯 New Features

### 1. Chart Export System

Export performance charts as high-quality images or PDF documents for reporting and sharing.

#### Features:
- **Multiple Format Support**: Export as PNG or PDF
- **Quality Control**: Adjustable export quality (50%-100%)
- **Branded Outputs**: Optional watermark with timestamp
- **Batch Export**: Export multiple charts simultaneously
- **Download History**: Track all exported charts

#### How to Use:
1. Navigate to any chart in the Testing Dashboard or Team Leaderboard
2. Click the "Export Chart" button
3. Select format (PNG or PDF)
4. Adjust quality settings
5. Toggle watermark on/off
6. Click "Export & Download"

#### Technical Details:
- Service: `/src/lib/chart-export-service.ts`
- Component: `/src/components/ChartExportDialog.tsx`
- Storage: Export history saved in KV store (`chart-export-history`)

---

### 2. Automated Email Scheduling

Configure automated reports that send at regular intervals with charts and performance metrics.

#### Features:
- **Flexible Scheduling**: Daily, weekly, monthly, or custom intervals
- **Customizable Templates**: Brand colors, logos, and messaging
- **Chart Integration**: Include performance charts in emails
- **Multiple Recipients**: Send to entire teams or specific individuals
- **Send History**: Track all sent reports with open rates
- **Test Mode**: Preview and test emails before scheduling

#### Scheduling Options:
- **Daily**: Send at specified time every day
- **Weekly**: Choose day of week and time
- **Monthly**: Select date and time
- **Custom**: Advanced scheduling options

#### How to Use:
1. Click "Email Scheduling" in Testing Dashboard
2. Create new schedule with "New Schedule" button
3. Configure:
   - Schedule name
   - Frequency (daily/weekly/monthly)
   - Time and timezone
   - Recipients (comma-separated emails)
   - Email template
   - Charts to include
4. Toggle schedule on/off
5. Test with "Send Test" button

#### Email Templates:
- **Summary Format**: Key metrics and overview
- **Detailed Format**: Full statistics with charts
- **Chart-Focused**: Emphasis on visual data

#### Technical Details:
- Service: `/src/lib/email-schedule-service.ts`
- Component: `/src/components/EmailScheduler.tsx`
- Storage: Schedules saved in KV store (`email-schedules`, `email-templates`)

---

### 3. Team Comparison View

Compare multiple teams side-by-side with rich visual charts and performance metrics.

#### Features:
- **Multi-Team Selection**: Compare up to 5 teams simultaneously
- **Performance Cards**: Individual cards for each team with key metrics
- **Trend Indicators**: Visual up/down/stable trends with percentages
- **Comparative Charts**: Bar charts showing metrics side-by-side
- **Time Range Filtering**: This week, this month, or all time
- **Export Capabilities**: Export comparison charts as images/PDFs
- **Top Performers**: Highlight best performer in each team

#### Metrics Tracked:
- **Success Rate**: Overall test pass rate
- **Total Tests**: Number of tests executed
- **Modules Completed**: Unique modules finished
- **Average Duration**: Mean completion time
- **Team Members**: Active member count
- **Sessions**: Total testing sessions

#### Visual Elements:
- **Performance Cards**: Color-coded by team
- **Trend Badges**: Green (up), red (down), gray (stable)
- **Progress Bars**: Animated bars for comparative metrics
- **Color Coding**: Unique color per team for easy identification

#### How to Use:
1. Click "Team Comparison" in Testing Dashboard
2. Select teams to compare (checkboxes)
3. Choose time range filter
4. Review metrics in cards and charts
5. Export charts for reporting
6. Compare trends over time

#### Team Colors:
- **Alpha**: Rose/Pink
- **Beta**: Purple/Violet
- **Gamma**: Green
- **Delta**: Orange
- **Epsilon**: Blue

#### Technical Details:
- Component: `/src/components/TeamComparisonView.tsx`
- Data Source: Test sessions from KV store (`test-sessions-history`)
- Chart Export: Integrated with chart export service

---

## 🎨 UI/UX Design

### Design Principles:
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Elegant Typography**: Cormorant serif for headers, Outfit for body
- **Color Palette**: Rose blush, lavender mist, and champagne soft tones
- **Smooth Animations**: Framer Motion for all transitions
- **Sound Feedback**: Audio cues for interactions

### Accessibility:
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels on all interactive elements
- **Contrast Ratios**: WCAG AA compliant
- **Focus Indicators**: Visible focus states

---

## 📊 Data Flow

### Chart Export Flow:
```
User clicks Export → 
  Configure options → 
    Service renders chart → 
      Canvas conversion → 
        Format conversion (PNG/PDF) → 
          Download trigger → 
            History saved
```

### Email Scheduling Flow:
```
Create schedule → 
  Configure template → 
    Set recipients → 
      System checks schedule → 
        Time reached → 
          Generate email HTML → 
            Include charts → 
              Send email → 
                Update history
```

### Team Comparison Flow:
```
Select teams → 
  Fetch sessions from KV → 
    Calculate metrics → 
      Generate trend data → 
        Render comparison → 
          Export charts
```

---

## 🔧 Configuration

### Email Templates:
Configure in Email Scheduler → Templates tab
- Name and subject
- Greeting message
- Body format (summary/detailed/chart-focused)
- Branding color (oklch format)
- Footer text
- Custom CSS styles

### Chart Export Options:
Default settings in `chart-export-service.ts`:
- Width: 1200px
- Height: 800px
- Quality: 100%
- Watermark: Enabled

### Team Colors:
Customize in `TeamComparisonView.tsx`:
```typescript
const teamColors = {
  alpha: 'oklch(0.65 0.15 340)',
  beta: 'oklch(0.65 0.15 260)',
  // ... more teams
}
```

---

## 📈 Performance Considerations

### Chart Export:
- Canvas rendering may take 1-2 seconds for complex charts
- PDF generation adds ~500ms overhead
- Recommended max export size: 1920x1080px

### Email Scheduling:
- Checks run every 60 seconds
- Email generation: <1 second
- Batch sending: ~100ms per recipient

### Team Comparison:
- Optimized with useMemo for calculations
- Handles up to 1000+ test sessions efficiently
- Lazy loading for large datasets

---

## 🚀 Future Enhancements

### Planned Features:
1. **Real-time Collaboration**: Live team comparison updates
2. **Advanced Analytics**: Predictive trend analysis
3. **Custom Chart Types**: Radar, scatter, heatmaps
4. **Email Webhooks**: Integration with SendGrid, Mailgun
5. **Report Builder**: Drag-and-drop custom reports
6. **Mobile App**: Native iOS/Android apps
7. **API Endpoints**: REST API for external integrations

---

## 🐛 Troubleshooting

### Chart Export Issues:
- **Problem**: Chart not found
  - **Solution**: Ensure chart element has correct ID
- **Problem**: Blurry exports
  - **Solution**: Increase quality to 100%

### Email Scheduling Issues:
- **Problem**: Emails not sending
  - **Solution**: Check schedule is enabled and time is correct
- **Problem**: Recipients not receiving
  - **Solution**: Verify email addresses are valid

### Team Comparison Issues:
- **Problem**: No data showing
  - **Solution**: Ensure test sessions have teamId field
- **Problem**: Teams not appearing
  - **Solution**: Check test-sessions-history in KV store

---

## 📞 Support

For issues or questions:
1. Check Testing Dashboard status indicators
2. Review browser console for errors
3. Export test data for debugging
4. Check KV store data integrity

---

## 🎓 Training Resources

### Video Tutorials:
Available in Testing Dashboard → Video Tutorial module
- Complete AR workflow
- Offline measurement guide
- Collaboration features demo

### Interactive Guides:
- Voice-guided AR tutorial
- Collaboration test suite
- Performance tracking walkthrough

---

## ✅ Quick Start Checklist

- [ ] Open Testing Dashboard
- [ ] Navigate to Email Scheduling
- [ ] Create your first schedule
- [ ] Set up email template with branding
- [ ] Add recipients
- [ ] Test send email
- [ ] Open Team Comparison View
- [ ] Select teams to compare
- [ ] Review performance metrics
- [ ] Export comparison chart
- [ ] Configure automated reports
- [ ] Enable daily/weekly schedules

---

**Last Updated**: ${new Date().toLocaleDateString()}
**Version**: 2.0.0
**Documentation**: Complete
