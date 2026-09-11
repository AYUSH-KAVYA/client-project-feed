import { PrismaClient, Role, TaskStatus, TaskPriority, ProjectApprovalStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // Clear existing data
  await prisma.modificationRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@agency.com',
      passwordHash,
      name: 'Alice Admin',
      role: Role.ADMIN,
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      email: 'pm.sarah@agency.com',
      passwordHash,
      name: 'Sarah Jenkins (PM)',
      role: Role.PROJECT_MANAGER,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      email: 'pm.david@agency.com',
      passwordHash,
      name: 'David Vance (PM)',
      role: Role.PROJECT_MANAGER,
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      email: 'dev.ravi@agency.com',
      passwordHash,
      name: 'Ravi Sharma',
      role: Role.DEVELOPER,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      email: 'dev.elena@agency.com',
      passwordHash,
      name: 'Elena Rostova',
      role: Role.DEVELOPER,
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      email: 'dev.marcus@agency.com',
      passwordHash,
      name: 'Marcus Vance',
      role: Role.DEVELOPER,
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      email: 'dev.chloe@agency.com',
      passwordHash,
      name: 'Chloe Bennett',
      role: Role.DEVELOPER,
    },
  });

  console.log('✅ Created Users');

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
      approvalStatus: ProjectApprovalStatus.APPROVED,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Globex Mobile Application',
      description: 'Cross-platform iOS and Android app for real-time logistics tracking.',
      clientId: clientGlobex.id,
      createdById: pm1.id,
      approvalStatus: ProjectApprovalStatus.APPROVED,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Stark Analytics Dashboard',
      description: 'High-frequency telemetry & metrics data visualization platform.',
      clientId: clientStark.id,
      createdById: pm2.id,
      approvalStatus: ProjectApprovalStatus.APPROVED,
    },
  });

  // A pending project request created by PM2 for Admin approval testing
  const pendingProject = await prisma.project.create({
    data: {
      name: 'Quantum Cyber Security Suite',
      description: 'Next-gen threat detection portal requiring Admin review.',
      clientId: clientStark.id,
      createdById: pm2.id,
      approvalStatus: ProjectApprovalStatus.PENDING_APPROVAL,
    },
  });

  console.log('✅ Created 4 Projects (3 Approved, 1 Pending Admin Approval)');

  const now = new Date();
  const pastDate1 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const pastDate2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const nearDueDate = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours away (< 1 day!)
  const futureDate2 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const futureDate3 = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000);

  // 4. Create Tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Setup Stripe Payment Gateway Integration',
      description: 'Implement secure webhook processing and checkout session workflow.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      isOverdue: true,
      dueDate: pastDate1,
      projectId: project1.id,
      assignedToId: dev1.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Design Product Catalog Filter Component',
      description: 'Multi-facet sidebar filter with category, price range, and tags.',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      isOverdue: false,
      dueDate: nearDueDate, // NEAR DUE DATE (< 24 hours)
      projectId: project1.id,
      assignedToId: dev1.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Optimize Core Web Vitals & Image Assets',
      description: 'Convert legacy PNGs to WebP and enable responsive srcset attributes.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      isOverdue: false,
      dueDate: futureDate2,
      projectId: project1.id,
      assignedToId: dev2.id,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Implement OAuth2 Social Login Providers',
      description: 'Add Google and GitHub OAuth flow with JWT cookie management.',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      isOverdue: false,
      dueDate: pastDate2,
      projectId: project1.id,
      assignedToId: dev2.id,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      title: 'Cart Persistence & Redis Caching',
      description: 'Store guest checkout items in Redis session storage.',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      isOverdue: false,
      dueDate: futureDate3,
      projectId: project1.id,
      assignedToId: dev3.id,
    },
  });

  const task6 = await prisma.task.create({
    data: {
      title: 'Background Location Tracking Service',
      description: 'Configure iOS background fetch and Android Foreground Service for GPS logging.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      isOverdue: true,
      dueDate: pastDate2,
      projectId: project2.id,
      assignedToId: dev3.id,
    },
  });

  const task7 = await prisma.task.create({
    data: {
      title: 'Push Notifications Integration (FCM)',
      description: 'Setup Firebase Cloud Messaging for shipment status triggers.',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      isOverdue: false,
      dueDate: nearDueDate,
      projectId: project2.id,
      assignedToId: dev4.id,
    },
  });

  const task8 = await prisma.task.create({
    data: {
      title: 'Driver Authentication & KYC Upload UI',
      description: 'Form submission UI for driver license scan verification.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      isOverdue: false,
      dueDate: futureDate2,
      projectId: project2.id,
      assignedToId: dev4.id,
    },
  });

  const task9 = await prisma.task.create({
    data: {
      title: 'Offline Sync Queue with SQLite',
      description: 'Store pending updates offline and sync when network recovers.',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      isOverdue: false,
      dueDate: futureDate3,
      projectId: project2.id,
      assignedToId: dev1.id,
    },
  });

  const task10 = await prisma.task.create({
    data: {
      title: 'Dark Mode UI Theme Support',
      description: 'Implement Tailwind dark theme color variables across app views.',
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      isOverdue: false,
      dueDate: pastDate1,
      projectId: project2.id,
      assignedToId: dev2.id,
    },
  });

  console.log('✅ Created 10 Tasks');

  // 5. Create Sample Dev Modification Requests for PM review
  await prisma.modificationRequest.create({
    data: {
      title: 'Add GraphQL Caching Layer to Mobile API',
      description: 'Ravi proposes adding Apollo Server in-memory response caching for mobile GPS queries.',
      devId: dev1.id, // Ravi
      pmId: pm1.id,   // Sarah PM
      projectId: project2.id,
      taskId: task9.id,
    },
  });

  await prisma.modificationRequest.create({
    data: {
      title: 'Upgrade to Tailwind CSS v4 Variable System',
      description: 'Elena proposes refactoring dark theme tokens to CSS native variables.',
      devId: dev2.id, // Elena
      pmId: pm1.id,   // Sarah PM
      projectId: project1.id,
      taskId: task3.id,
    },
  });

  console.log('✅ Created Sample Dev Modification Requests');
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
