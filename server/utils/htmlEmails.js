const baseStyles = `
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #111827;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
`;

const buttonSty = `
    display: inline-block;
    background-color: #3b82f6;
    padding: 12px 24px;
    border-radius: 6px;
    color: #ffffff;
    font-weight: 600;
    font-size: 16px;
    text-decoration: none;
    margin-top: 10px;
`;

const footerSty = `
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    font-size: 14px;
    color: #6b7280;
`;

const cardSty = `
    border: 1px solid #e5e7eb;
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 24px;
    background-color: #f9fafb;
`;

export const generateTaskAssignmentEmail = ({
    assigneeName,
    taskTitle,
    projectName,
    taskDescription,
    dueDate,
    origin,
}) => `
<!DOCTYPE html>
<html>
<head>
    <style>@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');</style>
</head>
<body style="background-color: #f3f4f6; padding: 20px 0;">
<div style="${baseStyles}">
    <h2 style="font-weight: 700; margin-top: 0;">Hi ${assigneeName}, 👋</h2>
    
    <p style="font-size: 16px;">You've been assigned a new task in <strong>${projectName}</strong>:</p>
    <p style="font-size: 18px; font-weight: 700; color: #3b82f6; margin: 12px 0;">${taskTitle}</p>
    
    <div style="${cardSty}">
        <p style="margin: 0 0 8px 0;"><strong>Description:</strong> <span style="color: #4b5563;">${taskDescription || "No description provided."}</span></p>
        <p style="margin: 0;"><strong>Due Date:</strong> <span style="color: #4b5563;">${new Date(dueDate).toLocaleDateString()}</span></p>
    </div>
    
    <a href="${origin}" style="${buttonSty}">View Task</a>

    <div style="${footerSty}">
        <p style="margin: 0 0 8px 0;">Please make sure to review and complete it before the due date.</p>
        <p style="margin: 0;">&mdash; The Project Management Team</p>
    </div>
</div>
</body>
</html>
`;

export const generateTaskReminderEmail = ({
    assigneeName,
    taskTitle,
    projectName,
    taskDescription,
    dueDate,
    origin,
}) => `
<!DOCTYPE html>
<html>
<head>
    <style>@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');</style>
</head>
<body style="background-color: #f3f4f6; padding: 20px 0;">
<div style="${baseStyles}">
    <h2 style="font-weight: 700; margin-top: 0;">Hi ${assigneeName}, 👋</h2>
    
    <p style="font-size: 16px;">You have a task due soon in <strong>${projectName}</strong>:</p>
    <p style="font-size: 18px; font-weight: 700; color: #3b82f6; margin: 12px 0;">${taskTitle}</p>
    
    <div style="${cardSty}; background-color: #fef3c7; border-color: #fde68a;">
        <p style="margin: 0 0 8px 0;"><strong>Description:</strong> <span style="color: #4b5563;">${taskDescription || "No description provided."}</span></p>
        <p style="margin: 0;"><strong>Due Date:</strong> <span style="color: #4b5563;">${new Date(dueDate).toLocaleDateString()}</span></p>
    </div>
    
    <a href="${origin}" style="${buttonSty}">View Task</a>

    <div style="${footerSty}">
        <p style="margin: 0 0 8px 0;">Please make sure to review and complete it as soon as possible.</p>
        <p style="margin: 0;">&mdash; The Project Management Team</p>
    </div>
</div>
</body>
</html>
`;

export const generateProjectInviteEmail = ({
    inviterName,
    projectName,
    origin,
}) => `
<!DOCTYPE html>
<html>
<head>
    <style>@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');</style>
</head>
<body style="background-color: #f3f4f6; padding: 20px 0;">
<div style="${baseStyles}">
    <h2 style="font-weight: 700; margin-top: 0;">You're Invited! 🎉</h2>
    
    <p style="font-size: 16px;"><strong>${inviterName}</strong> has invited you to collaborate on the project <strong>${projectName}</strong>.</p>
    
    <div style="${cardSty}">
        <p style="margin: 0; color: #4b5563;">Join the team and start contributing to tasks, discussions, and the project timeline.</p>
    </div>
    
    <a href="${origin}" style="${buttonSty}; background-color: #10b981;">Accept Invitation</a>

    <div style="${footerSty}">
        <p style="margin: 0 0 8px 0;">If you don't recognize this invitation, you can safely ignore this email.</p>
        <p style="margin: 0;">&mdash; The Project Management Team</p>
    </div>
</div>
</body>
</html>
`;

export const generateTaskCommentEmail = ({
    commenterName,
    taskTitle,
    commentContent,
    origin,
}) => `
<!DOCTYPE html>
<html>
<head>
    <style>@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');</style>
</head>
<body style="background-color: #f3f4f6; padding: 20px 0;">
<div style="${baseStyles}">
    <h2 style="font-weight: 700; margin-top: 0;">New Comment 💬</h2>
    
    <p style="font-size: 16px;"><strong>${commenterName}</strong> left a comment on your task <strong>${taskTitle}</strong>:</p>
    
    <div style="${cardSty}; border-left: 4px solid #3b82f6;">
        <p style="margin: 0; font-style: italic; color: #4b5563;">"${commentContent}"</p>
    </div>
    
    <a href="${origin}" style="${buttonSty}">Reply to Comment</a>

    <div style="${footerSty}">
        <p style="margin: 0 0 8px 0;">You are receiving this because you are following or assigned to this task.</p>
        <p style="margin: 0;">&mdash; The Project Management Team</p>
    </div>
</div>
</body>
</html>
`;
