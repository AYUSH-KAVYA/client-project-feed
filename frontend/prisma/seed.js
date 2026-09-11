"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting Database Seeding...');
    // Clear existing data
    await prisma.notification.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();
    const passwordHash = await bcryptjs_1.default.hash('password123', 10);
    // 1. Create Users
    const admin = await prisma.user.create({
        data: {
            email: 'admin@agency.com',
            passwordHash,
            name: 'Alice Admin',
            role: client_1.Role.ADMIN,
        },
    });
    const pm1 = await prisma.user.create({
        data: {
            email: 'pm.sarah@agency.com',
            passwordHash,
            name: 'Sarah Jenkins (PM)',
            role: client_1.Role.PROJECT_MANAGER,
        },
    });
    const pm2 = await prisma.user.create({
        data: {
            email: 'pm.david@agency.com',
            passwordHash,
            name: 'David Vance (PM)',
            role: client_1.Role.PROJECT_MANAGER,
        },
    });
    const dev1 = await prisma.user.create({
        data: {
            email: 'dev.ravi@agency.com',
            passwordHash,
            name: 'Ravi Sharma',
            role: client_1.Role.DEVELOPER,
        },
    });
    const dev2 = await prisma.user.create({
        data: {
            email: 'dev.elena@agency.com',
            passwordHash,
            name: 'Elena Rostova',
            role: client_1.Role.DEVELOPER,
        },
    });
    const dev3 = await prisma.user.create({
        data: {
            email: 'dev.marcus@agency.com',
            passwordHash,
            name: 'Marcus Vance',
            role: client_1.Role.DEVELOPER,
        },
    });
    const dev4 = await prisma.user.create({
        data: {
            email: 'dev.chloe@agency.com',
            passwordHash,
            name: 'Chloe Bennett',
            role: client_1.Role.DEVELOPER,
        },
    });
    console.log('✅ Created Users (1 Admin, 2 PMs, 4 Devs)');
    // 2. Create Clients
    const clientAcme = await prisma.client.create({
        data: {
            name: 'Acme Corporation',
            company: 'Acme Corp',
            email: 'contact@acme.com',
            phone: '+1 555-0192',
        },
    });
    const clientGlobex = await prisma.client.create({
        data: {
            name: 'Globex Industries',
            company: 'Globex Inc',
            email: 'info@globex.com',
            phone: '+1 555-0144',
        },
    });
    const clientStark = await prisma.client.create({
        data: {
            name: 'Stark Enterprises',
            company: 'Stark Tech',
            email: 'support@stark.com',
            phone: '+1 555-0188',
        },
    });
    console.log('✅ Created 3 Clients');
    // 3. Create Projects
    const project1 = await prisma.project.create({
        data: {
            name: 'Acme E-Commerce Redesign',
            description: 'Complete storefront overhaul with modern React UI & Stripe checkout integration.',
            clientId: clientAcme.id,
            createdById: pm1.id,
        },
    });
    const project2 = await prisma.project.create({
        data: {
            name: 'Globex Mobile Application',
            description: 'Cross-platform iOS and Android app for real-time logistics tracking.',
            clientId: clientGlobex.id,
            createdById: pm1.id,
        },
    });
    const project3 = await prisma.project.create({
        data: {
            name: 'Stark Analytics Dashboard',
            description: 'High-frequency telemetry & metrics data visualization platform.',
            clientId: clientStark.id,
            createdById: pm2.id,
        },
    });
    console.log('✅ Created 3 Projects');
    const now = new Date();
    const pastDate1 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000); // 4 days ago
    const pastDate2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    const futureDate1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    const futureDate2 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
    const futureDate3 = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000); // 9 days from now
    // 4. Create Tasks for Project 1 (Acme - PM: Sarah)
    const task1 = await prisma.task.create({
        data: {
            title: 'Setup Stripe Payment Gateway Integration',
            description: 'Implement secure webhook processing and checkout session workflow.',
            status: client_1.TaskStatus.IN_PROGRESS,
            priority: client_1.TaskPriority.CRITICAL,
            isOverdue: true,
            dueDate: pastDate1, // OVERDUE
            projectId: project1.id,
            assignedToId: dev1.id, // Ravi
        },
    });
    const task2 = await prisma.task.create({
        data: {
            title: 'Design Product Catalog Filter Component',
            description: 'Multi-facet sidebar filter with category, price range, and tags.',
            status: client_1.TaskStatus.IN_REVIEW,
            priority: client_1.TaskPriority.HIGH,
            isOverdue: false,
            dueDate: futureDate1,
            projectId: project1.id,
            assignedToId: dev1.id, // Ravi
        },
    });
    const task3 = await prisma.task.create({
        data: {
            title: 'Optimize Core Web Vitals & Image Assets',
            description: 'Convert legacy PNGs to WebP and enable responsive srcset attributes.',
            status: client_1.TaskStatus.TODO,
            priority: client_1.TaskPriority.MEDIUM,
            isOverdue: false,
            dueDate: futureDate2,
            projectId: project1.id,
            assignedToId: dev2.id, // Elena
        },
    });
    const task4 = await prisma.task.create({
        data: {
            title: 'Implement OAuth2 Social Login Providers',
            description: 'Add Google and GitHub OAuth flow with JWT cookie management.',
            status: client_1.TaskStatus.DONE,
            priority: client_1.TaskPriority.HIGH,
            isOverdue: false,
            dueDate: pastDate2,
            projectId: project1.id,
            assignedToId: dev2.id, // Elena
        },
    });
    const task5 = await prisma.task.create({
        data: {
            title: 'Cart Persistence & Redis Caching',
            description: 'Store guest checkout items in Redis session storage.',
            status: client_1.TaskStatus.TODO,
            priority: client_1.TaskPriority.LOW,
            isOverdue: false,
            dueDate: futureDate3,
            projectId: project1.id,
            assignedToId: dev3.id, // Marcus
        },
    });
    // Create Tasks for Project 2 (Globex - PM: Sarah)
    const task6 = await prisma.task.create({
        data: {
            title: 'Background Location Tracking Service',
            description: 'Configure iOS background fetch and Android Foreground Service for GPS logging.',
            status: client_1.TaskStatus.IN_PROGRESS,
            priority: client_1.TaskPriority.CRITICAL,
            isOverdue: true,
            dueDate: pastDate2, // OVERDUE
            projectId: project2.id,
            assignedToId: dev3.id, // Marcus
        },
    });
    const task7 = await prisma.task.create({
        data: {
            title: 'Push Notifications Integration (FCM)',
            description: 'Setup Firebase Cloud Messaging for shipment status triggers.',
            status: client_1.TaskStatus.IN_REVIEW,
            priority: client_1.TaskPriority.HIGH,
            isOverdue: false,
            dueDate: futureDate1,
            projectId: project2.id,
            assignedToId: dev4.id, // Chloe
        },
    });
    const task8 = await prisma.task.create({
        data: {
            title: 'Driver Authentication & KYC Upload UI',
            description: 'Form submission UI for driver license scan verification.',
            status: client_1.TaskStatus.TODO,
            priority: client_1.TaskPriority.MEDIUM,
            isOverdue: false,
            dueDate: futureDate2,
            projectId: project2.id,
            assignedToId: dev4.id, // Chloe
        },
    });
    const task9 = await prisma.task.create({
        data: {
            title: 'Offline Sync Queue with SQLite',
            description: 'Store pending updates offline and sync when network recovers.',
            status: client_1.TaskStatus.TODO,
            priority: client_1.TaskPriority.HIGH,
            isOverdue: false,
            dueDate: futureDate3,
            projectId: project2.id,
            assignedToId: dev1.id, // Ravi
        },
    });
    const task10 = await prisma.task.create({
        data: {
            title: 'Dark Mode UI Theme Support',
            description: 'Implement Tailwind dark theme color variables across app views.',
            status: client_1.TaskStatus.DONE,
            priority: client_1.TaskPriority.LOW,
            isOverdue: false,
            dueDate: pastDate1,
            projectId: project2.id,
            assignedToId: dev2.id, // Elena
        },
    });
    // Create Tasks for Project 3 (Stark Analytics - PM: David)
    const task11 = await prisma.task.create({
        data: {
            title: 'WebSocket Real-Time Telemetry Feed',
            description: 'High-throughput Socket connection handling 1000 msgs/sec.',
            status: client_1.TaskStatus.IN_PROGRESS,
            priority: client_1.TaskPriority.CRITICAL,
            isOverdue: false,
            dueDate: futureDate1,
            projectId: project3.id,
            assignedToId: dev2.id, // Elena
        },
    });
    const task12 = await prisma.task.create({
        data: {
            title: 'Chart.js / Recharts Dynamic Rendering',
            description: 'Render multi-axis line graphs with zoomable time windows.',
            status: client_1.TaskStatus.IN_REVIEW,
            priority: client_1.TaskPriority.HIGH,
            isOverdue: false,
            dueDate: futureDate2,
            projectId: project3.id,
            assignedToId: dev3.id, // Marcus
        },
    });
    const task13 = await prisma.task.create({
        data: {
            title: 'Export Metric Reports to PDF & CSV',
            description: 'Server-side report generator with formatted data tables.',
            status: client_1.TaskStatus.TODO,
            priority: client_1.TaskPriority.MEDIUM,
            isOverdue: false,
            dueDate: futureDate3,
            projectId: project3.id,
            assignedToId: dev4.id, // Chloe
        },
    });
    const task14 = await prisma.task.create({
        data: {
            title: 'Role-Based Metric Masking Rules',
            description: 'Restrict confidential financial telemetry from standard viewers.',
            status: client_1.TaskStatus.TODO,
            priority: client_1.TaskPriority.HIGH,
            isOverdue: false,
            dueDate: futureDate2,
            projectId: project3.id,
            assignedToId: dev1.id, // Ravi
        },
    });
    const task15 = await prisma.task.create({
        data: {
            title: 'Database Index Tuning & Query Audit',
            description: 'Add composite indexes on timestamp and device ID columns.',
            status: client_1.TaskStatus.DONE,
            priority: client_1.TaskPriority.MEDIUM,
            isOverdue: false,
            dueDate: pastDate2,
            projectId: project3.id,
            assignedToId: dev2.id, // Elena
        },
    });
    console.log('✅ Created 15 Tasks (including 2 Overdue tasks)');
    // 5. Create Pre-existing Activity Logs
    const activities = [
        {
            taskId: task1.id,
            projectId: project1.id,
            userId: dev1.id,
            action: 'STATUS_CHANGE',
            previousStatus: client_1.TaskStatus.TODO,
            newStatus: client_1.TaskStatus.IN_PROGRESS,
            message: `Ravi Sharma moved Task #${task1.taskNumber} from To Do → In Progress`,
            createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        },
        {
            taskId: task2.id,
            projectId: project1.id,
            userId: dev1.id,
            action: 'STATUS_CHANGE',
            previousStatus: client_1.TaskStatus.IN_PROGRESS,
            newStatus: client_1.TaskStatus.IN_REVIEW,
            message: `Ravi Sharma moved Task #${task2.taskNumber} from In Progress → In Review`,
            createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
            taskId: task7.id,
            projectId: project2.id,
            userId: dev4.id,
            action: 'STATUS_CHANGE',
            previousStatus: client_1.TaskStatus.IN_PROGRESS,
            newStatus: client_1.TaskStatus.IN_REVIEW,
            message: `Chloe Bennett moved Task #${task7.taskNumber} from In Progress → In Review`,
            createdAt: new Date(now.getTime() - 90 * 60 * 1000), // 90 mins ago
        },
        {
            taskId: task12.id,
            projectId: project3.id,
            userId: dev3.id,
            action: 'STATUS_CHANGE',
            previousStatus: client_1.TaskStatus.IN_PROGRESS,
            newStatus: client_1.TaskStatus.IN_REVIEW,
            message: `Marcus Vance moved Task #${task12.taskNumber} from In Progress → In Review`,
            createdAt: new Date(now.getTime() - 45 * 60 * 1000), // 45 mins ago
        },
        {
            taskId: task6.id,
            projectId: project2.id,
            userId: pm1.id,
            action: 'TASK_OVERDUE',
            previousStatus: client_1.TaskStatus.IN_PROGRESS,
            newStatus: client_1.TaskStatus.IN_PROGRESS,
            message: `System flagged Task #${task6.taskNumber} "Background Location Tracking Service" as OVERDUE`,
            createdAt: new Date(now.getTime() - 15 * 60 * 1000), // 15 mins ago
        },
    ];
    for (const act of activities) {
        await prisma.activityLog.create({ data: act });
    }
    console.log('✅ Created Pre-existing Activity Logs');
    // 6. Create Pre-existing Notifications
    await prisma.notification.createMany({
        data: [
            {
                userId: pm1.id, // Sarah PM
                title: 'Task Ready for Review',
                message: `Task #${task2.taskNumber} "${task2.title}" was moved to In Review by Ravi Sharma`,
                taskId: task2.id,
                isRead: false,
                createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            },
            {
                userId: pm1.id, // Sarah PM
                title: 'Task Ready for Review',
                message: `Task #${task7.taskNumber} "${task7.title}" was moved to In Review by Chloe Bennett`,
                taskId: task7.id,
                isRead: false,
                createdAt: new Date(now.getTime() - 90 * 60 * 1000),
            },
            {
                userId: dev1.id, // Ravi
                title: 'New Task Assigned',
                message: `You have been assigned to Task #${task1.taskNumber}: "${task1.title}"`,
                taskId: task1.id,
                isRead: true,
                createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
            },
            {
                userId: pm2.id, // David PM
                title: 'Task Ready for Review',
                message: `Task #${task12.taskNumber} "${task12.title}" was moved to In Review by Marcus Vance`,
                taskId: task12.id,
                isRead: false,
                createdAt: new Date(now.getTime() - 45 * 60 * 1000),
            },
        ],
    });
    console.log('✅ Created Pre-existing Notifications');
    console.log('🎉 Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
