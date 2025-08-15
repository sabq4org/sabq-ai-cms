#!/usr/bin/env node
/*
  Cleanup Trial Users Script
  - Deletes unverified, non-admin/editorial users and their related data
  - Excludes: admins, system_admin, editors, writers, moderators, reporters, and any user who authored/created content
  - Also deletes related rows to avoid FK conflicts
*/

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const protectedRoleNames = [
  'admin',
  'system_admin',
  'super_admin',
  'owner',
  'manager',
  'moderator',
  'editor',
  'chief_editor',
  'writer',
  'reporter',
  'staff',
  'team'
];

async function getProtectedUserIds() {
  const protectedIds = new Set();

  // 1) users with is_admin = true or role in protectedRoleNames
  const directProtected = await prisma.users.findMany({
    where: {
      OR: [
        { is_admin: true },
        { role: { in: protectedRoleNames } }
      ]
    },
    select: { id: true }
  });
  directProtected.forEach(u => protectedIds.add(u.id));

  // 2) users linked in reporters table
  const reporters = await prisma.reporters.findMany({ select: { user_id: true } });
  reporters.forEach(r => r.user_id && protectedIds.add(r.user_id));

  // 3) users mapped via user_roles → roles
  const roles = await prisma.roles.findMany({ where: { name: { in: protectedRoleNames } }, select: { id: true } });
  if (roles.length) {
    const roleIds = roles.map(r => r.id);
    const userRoles = await prisma.user_roles.findMany({ where: { role_id: { in: roleIds } }, select: { user_id: true } });
    userRoles.forEach(ur => ur.user_id && protectedIds.add(ur.user_id));
  }

  // 4) any user who authored articles
  const authors = await prisma.articles.findMany({
    select: { author_id: true },
    distinct: ['author_id']
  });
  authors.forEach(a => a.author_id && protectedIds.add(a.author_id));

  // 5) users who created other content (audio, muqtarab, ads, media)
  const createdBySources = await Promise.all([
    prisma.audio_programs.findMany({ select: { created_by: true }, distinct: ['created_by'] }),
    prisma.audio_episodes.findMany({ select: { created_by: true }, distinct: ['created_by'] }),
    prisma.MuqtarabCorner.findMany({ select: { created_by: true }, distinct: ['created_by'] }),
    prisma.MuqtarabArticle.findMany({ select: { created_by: true }, distinct: ['created_by'] }),
    prisma.ads.findMany({ select: { created_by: true }, distinct: ['created_by'] }),
    prisma.MediaFolder.findMany({ select: { createdById: true }, distinct: ['createdById'] }),
    prisma.MediaAsset.findMany({ select: { uploadedById: true }, distinct: ['uploadedById'] })
  ]);
  createdBySources.flat().forEach(r => {
    const id = r.created_by || r.createdById || r.uploadedById;
    if (id) protectedIds.add(id);
  });

  return protectedIds;
}

async function findTrialUsers(protectedIds) {
  // exclude sabq.org emails for extra safety
  const teamMembers = await prisma.team_members.findMany({ where: { email: { not: null } }, select: { email: true } });
  const protectedEmails = new Set(teamMembers.map(t => t.email).filter(Boolean));

  const allCandidates = await prisma.users.findMany({
    where: {
      is_verified: false,
      is_admin: false,
      role: { notIn: protectedRoleNames },
      AND: [
        { NOT: { email: { endsWith: '@sabq.org' } } }
      ]
    },
    select: { id: true, email: true }
  });

  const trial = allCandidates.filter(u => !protectedIds.has(u.id) && !protectedEmails.has(u.email));
  return trial;
}

async function deleteRelatedData(userIds, emails) {
  const idList = userIds;
  const emailList = emails;

  const tasks = [
    prisma.RefreshToken.deleteMany({ where: { userId: { in: idList } } }),
    prisma.interactions.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.UserInteractions.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.UserDailyActivities.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.LoyaltyTransactions.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.SmartNotifications.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.SearchQueries.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.user_preferences.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.user_reading_sessions.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.user_insights.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.user_interests.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.UserSettings.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.UserSessions.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.user_roles.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.password_reset_tokens.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.UserBadges.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.UserRecommendations.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.smart_dose_feedback.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.SentimentAnalysis.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.MLPredictions.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.activity_logs.deleteMany({ where: { user_id: { in: idList } } }),
    prisma.email_verification_codes.deleteMany({ where: { OR: [ { user_id: { in: idList } }, { email: { in: emailList } } ] } })
  ];

  // Non-relational or optional references (no FK) are intentionally skipped (e.g., comments, messages)
  await prisma.$transaction(tasks);
}

async function main() {
  const start = Date.now();
  console.log('🔎 Gathering protected user ids...');
  const protectedIds = await getProtectedUserIds();
  console.log(`🛡️ Protected users count: ${protectedIds.size}`);

  console.log('🧪 Finding trial users (unverified, non-admin/editorial, not @sabq.org)...');
  const trialUsers = await findTrialUsers(protectedIds);
  if (!trialUsers.length) {
    console.log('✅ No trial users found to delete.');
    return;
  }
  const trialIds = trialUsers.map(u => u.id);
  const trialEmails = trialUsers.map(u => u.email);

  console.log(`🧹 Will delete ${trialUsers.length} trial users.`);
  console.log(trialEmails.map(e => ` - ${e}`).join('\n'));

  console.log('🧷 Deleting related data to avoid FK conflicts...');
  await deleteRelatedData(trialIds, trialEmails);

  console.log('👤 Deleting users...');
  const delRes = await prisma.users.deleteMany({ where: { id: { in: trialIds } } });
  console.log(`🗑️ Deleted users: ${delRes.count}`);

  console.log(`✨ Done in ${(Date.now() - start)} ms.`);
}

main()
  .catch(err => {
    console.error('❌ Cleanup failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


