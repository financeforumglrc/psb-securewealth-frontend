/**
 * Non-destructive demo data seeder.
 * Only inserts records if the tables are empty, so it is safe to run on startup.
 *
 * WARNING: All data is fictional.
 */

const bcrypt = require('bcryptjs');
const { db, userDb, bankingDb, fraudDb } = require('../services/database');
const { generateCase, persistCase } = require('../lib/fraudGenerator');

const DEMO_PASSWORD = 'password123';

const demoUsers = [
    { id: 'deepanshu-sharma', name: 'Deepanshu Sharma', email: 'deepanshu@example.com', phone: '9876543210', tier: 'premium', role: 'user' },
    { id: 'priya-patel', name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211', tier: 'premium', role: 'user' },
    { id: 'arjun-iyer', name: 'Arjun Iyer', email: 'arjun@example.com', phone: '9876543212', tier: 'free', role: 'user' },
    { id: 'riya-gupta', name: 'Riya Gupta', email: 'riya@example.com', phone: '9876543213', tier: 'enterprise', role: 'user' },
    { id: 'vikram-rao', name: 'Vikram Rao', email: 'vikram@example.com', phone: '9876543214', tier: 'free', role: 'user' },
    { id: 'ananya-menon', name: 'Ananya Menon', email: 'ananya@example.com', phone: '9876543215', tier: 'premium', role: 'user' },
    { id: 'karan-malik', name: 'Karan Malik', email: 'karan@example.com', phone: '9876543216', tier: 'enterprise', role: 'user' },
    { id: 'neha-shah', name: 'Neha Shah', email: 'neha@example.com', phone: '9876543217', tier: 'free', role: 'user' },
];

const panFor = (idx) => `ABCDE${String(idx).padStart(4, '0')}F`;
const aadhaarFor = (idx) => `XXXX XXXX ${String(1000 + idx).slice(-4)}`;

async function seedUsers() {
    const existing = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (existing.count > 0) {
        console.log('[seedDemoData] users table not empty, skipping user seed.');
        return;
    }

    console.log('[seedDemoData] seeding demo users...');
    const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);

    const insert = db.transaction(() => {
        demoUsers.forEach((u, idx) => {
            userDb.create({
                id: u.id,
                email: u.email,
                password: hashed,
                name: u.name,
                phone: u.phone,
                role: u.role,
                tier: u.tier,
                pan_number: panFor(idx),
                aadhar: aadhaarFor(idx),
            });
        });
    });
    insert();
    console.log(`[seedDemoData] seeded ${demoUsers.length} demo users.`);
}

function seedBanking() {
    const existing = db.prepare('SELECT COUNT(*) as count FROM bank_accounts').get();
    if (existing.count > 0) {
        console.log('[seedDemoData] bank_accounts not empty, skipping banking seed.');
        return;
    }

    // Only seed banking data for demo users that actually exist in this database
    const demoIds = demoUsers.map(u => u.id);
    const placeholders = demoIds.map(() => '?').join(',');
    const presentRows = db.prepare(`SELECT id FROM users WHERE id IN (${placeholders})`).all(...demoIds);
    const presentIds = new Set(presentRows.map(r => r.id));
    if (presentIds.size === 0) {
        console.log('[seedDemoData] no demo users present, skipping banking seed.');
        return;
    }

    console.log('[seedDemoData] seeding demo banking data...');
    const insert = db.transaction(() => {
        demoUsers.filter(u => presentIds.has(u.id)).forEach((u, idx) => {
            const accountNumber = `SBIN000${String(100000 + idx).slice(-6)}`;
            const balance = 50000 + idx * 25000;
            bankingDb.createAccount({
                userId: u.id,
                accountNumber,
                type: 'savings',
                balance,
                ifsc: `SBIN0${String(100000 + idx)}`,
                branch: 'Mumbai Main',
                status: 'active',
            });

            // a few sample transactions
            const txnTypes = ['credit', 'debit', 'transfer', 'upi'];
            for (let t = 0; t < 4; t++) {
                bankingDb.createTransaction({
                    userId: u.id,
                    fromAccount: t % 2 === 0 ? null : accountNumber,
                    toAccount: t % 2 === 0 ? accountNumber : 'XXXX1234',
                    type: txnTypes[t],
                    amount: 500 + t * 350,
                    description: `Demo ${txnTypes[t]} transaction`,
                    status: 'completed',
                    referenceId: `TXN-DEMO-${u.id}-${t}`,
                });
            }

            // goals
            bankingDb.createGoal({
                userId: u.id,
                name: idx % 2 === 0 ? 'Emergency Fund' : 'Europe Trip',
                targetAmount: idx % 2 === 0 ? 500000 : 300000,
                currentAmount: idx % 2 === 0 ? 120000 : 45000,
                deadline: '2026-12-31',
                goalType: 'savings',
                status: 'active',
            });

            // bills
            bankingDb.createBill({
                userId: u.id,
                name: 'Electricity Bill',
                category: 'utilities',
                amount: 1250 + idx * 50,
                dueDate: '2026-07-05',
                status: 'upcoming',
                isRecurring: true,
                frequency: 'monthly',
            });

            // loans for premium/enterprise users
            if (u.tier === 'premium' || u.tier === 'enterprise') {
                bankingDb.createLoan({
                    userId: u.id,
                    loanType: 'personal',
                    principalAmount: 500000,
                    interestRate: 11.5,
                    tenureMonths: 36,
                    emiAmount: 16450,
                    totalPayable: 592200,
                    nextDueDate: '2026-07-10',
                    status: 'active',
                    purpose: 'Home renovation',
                });
            }
        });
    });
    insert();
    console.log('[seedDemoData] seeded demo banking data.');
}

function seedFraudCases(count = 500) {
    const existing = db.prepare('SELECT COUNT(*) as count FROM fraud_cases').get();
    if (existing.count > 0) {
        console.log('[seedDemoData] fraud_cases not empty, skipping fraud seed.');
        return;
    }

    console.log(`[seedDemoData] seeding ${count} synthetic fraud cases...`);
    const insert = db.transaction(() => {
        for (let i = 0; i < count; i++) {
            const c = generateCase(i, count);
            persistCase(c, fraudDb, {
                note: Math.random() < 0.3 ? `Initial triage: ${c.riskFactors.slice(0, 3).join(', ')} flagged.` : null,
            });
        }
    });
    insert();
    console.log(`[seedDemoData] seeded ${count} fraud cases.`);
}

async function seedAll() {
    try {
        await seedUsers();
        seedBanking();
        seedFraudCases(500);
        console.log('[seedDemoData] done.');
    } catch (err) {
        console.error('[seedDemoData] error:', err);
    }
}

if (require.main === module) {
    seedAll();
}

module.exports = { seedAll };
