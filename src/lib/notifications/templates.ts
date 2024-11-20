interface TemplateData {
  [key: string]: any;
}

const templates = {
  dailyHealth: (data: TemplateData) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2c3e50;">Daily Health Report</h1>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2>System Overview</h2>
        <p>Uptime: ${data.uptime}%</p>
        <p>Total Newsletters Sent: ${data.newslettersSent}</p>
        <p>Average Response Time: ${data.avgResponseTime}ms</p>
      </div>
      
      <div style="margin-top: 20px;">
        <h2>Service Status</h2>
        ${Object.entries(data.services).map(([service, status]) => `
          <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
            <span>${service}</span>
            <span style="color: ${status ? '#28a745' : '#dc3545'}">${status ? '✓' : '✗'}</span>
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: 20px;">
        <h2>Recent Errors (Last 24h)</h2>
        ${data.recentErrors.map((error: any) => `
          <div style="background: #fff3f3; padding: 10px; margin: 5px 0; border-left: 4px solid #dc3545;">
            <p><strong>${error.context}</strong></p>
            <p>${error.message}</p>
            <small>${new Date(error.timestamp).toLocaleString()}</small>
          </div>
        `).join('')}
      </div>
    </div>
  `,

  errorAlert: (data: TemplateData) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: ${data.priority === 'critical' ? '#dc3545' : '#ffc107'};">
        ${data.subject}
      </h1>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        <p><strong>Context:</strong> ${data.context}</p>
        <p><strong>Priority:</strong> ${data.priority.toUpperCase()}</p>
        ${data.error ? `
          <div style="background: #fff; padding: 15px; border-left: 4px solid #dc3545;">
            <p><strong>Error:</strong> ${data.error.message}</p>
            <pre style="overflow-x: auto;">${data.error.stack}</pre>
          </div>
        ` : ''}
      </div>
    </div>
  `,

  systemStatus: (data: TemplateData) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2c3e50;">System Status Update</h1>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2>Current Status: ${data.systemHealth}</h2>
        <div style="margin-top: 15px;">
          ${Object.entries(data.services).map(([service, status]) => `
            <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
              <span>${service}</span>
              <span style="color: ${status ? '#28a745' : '#dc3545'}">${status ? 'Operational' : 'Down'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `
};

export default templates;
