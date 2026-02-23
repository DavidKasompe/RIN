import {
    feature,
    plan,
    planFeature,
} from 'atmn';

export const aiRiskAnalysis = feature({
    id: 'ai_risk_analysis',
    name: 'Full AI risk analysis & conversational UI',
    type: 'boolean',
});

export const interventionLogging = feature({
    id: 'intervention_logging',
    name: 'Intervention logging & history',
    type: 'boolean',
});

export const calendarSync = feature({
    id: 'calendar_sync',
    name: 'Google Calendar bi-directional sync',
    type: 'boolean',
});

export const emailAlerts = feature({
    id: 'email_alerts',
    name: 'Automated parent email alerts',
    type: 'boolean',
});

export const schoolTeam = plan({
    id: 'pro',
    name: 'School Team',
    description: 'Perfect for individual schools and intervention teams.',
    add_on: false,
    auto_enable: false,
    price: {
        amount: 249,
        interval: 'month',
    },
});

export default {
    features: [aiRiskAnalysis, interventionLogging, calendarSync, emailAlerts],
    plans: [schoolTeam],
};
