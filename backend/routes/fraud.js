/**
 * Fraud Intelligence Center API
 * Admin-only endpoints for comprehensive fraud case management,
 * multi-hop tracing, exports, and alerting rules.
 */

const express = require('express');
const ExcelJS = require('exceljs');
const { fraudDb, bankingDb } = require('../services/database');
const { adminApiAuth, getAdminIdFromToken } = require('../middleware/auth');

const router = express.Router();

const VALID_STATUSES = ['open', 'investigating', 'escalated', 'closed', 'false_positive'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];
const VALID_CATEGORIES = ['account_takeover', 'mule_transfer', 'card_fraud', 'phishing', 'insider', 'identity_theft', 'velocity'];
const VALID_ACTIONS = ['acknowledge', 'investigate', 'escalate', 'close', 'false_positive'];

function audit(req, action, entityType, entityId, details) {
    try {
        bankingDb.createAuditLog({
            userId: getAdminIdFromToken(req) || 'admin',
            action,
            entityType,
            entityId,
            newValue: details ? JSON.stringify(details) : null,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
    } catch (e) {
        console.error('[Fraud] audit log failed', e.message);
    }
}

function normalizeCaseRow(row) {
    return {
        ...row,
        riskFactors: row.risk_factors ? JSON.parse(row.risk_factors) : [],
        countryRiskTags: row.country_risk_tags ? JSON.parse(row.country_risk_tags) : []
    };
}

// GET /api/v1/fraud/cases — list/filter/paginate
router.get('/cases', adminApiAuth, (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            priority: req.query.priority,
            category: req.query.category,
            assignedAdminId: req.query.assignedAdminId,
            userId: req.query.userId,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            minRisk: req.query.minRisk !== undefined ? parseFloat(req.query.minRisk) : undefined,
            maxRisk: req.query.maxRisk !== undefined ? parseFloat(req.query.maxRisk) : undefined,
            q: req.query.q,
            sort: req.query.sort,
            order: req.query.order,
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 50,
        };
        const result = fraudDb.getCases(filters);
        res.json({ success: true, ...result, cases: result.cases.map(normalizeCaseRow) });
    } catch (error) {
        console.error('List fraud cases error:', error);
        res.status(500).json({ success: false, error: 'Failed to load fraud cases' });
    }
});

// POST /api/v1/fraud/cases — create a case manually
router.post('/cases', adminApiAuth, (req, res) => {
    try {
        const data = req.body;
        if (!data.caseRef) return res.status(400).json({ success: false, error: 'caseRef is required' });
        const result = fraudDb.createCase(data);
        audit(req, 'CREATE', 'fraud_case', result.lastInsertRowid, { caseRef: data.caseRef });
        res.status(201).json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        console.error('Create fraud case error:', error);
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ success: false, error: 'caseRef already exists' });
        }
        res.status(500).json({ success: false, error: 'Failed to create fraud case' });
    }
});

// GET /api/v1/fraud/cases/:id — full case with hops, accounts, notes
router.get('/cases/:id', adminApiAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ success: false, error: 'Invalid case id' });
        const caseData = fraudDb.getFullCase(id);
        if (!caseData) return res.status(404).json({ success: false, error: 'Case not found' });
        audit(req, 'VIEW', 'fraud_case', id, { caseRef: caseData.case_ref });
        res.json({ success: true, case: caseData });
    } catch (error) {
        console.error('Get fraud case error:', error);
        res.status(500).json({ success: false, error: 'Failed to load fraud case' });
    }
});

// PATCH /api/v1/fraud/cases/:id — update status, priority, assignee, etc.
router.patch('/cases/:id', adminApiAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        if (data.status && !VALID_STATUSES.includes(data.status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }
        if (data.priority && !VALID_PRIORITIES.includes(data.priority)) {
            return res.status(400).json({ success: false, error: 'Invalid priority' });
        }
        fraudDb.updateCase(id, data);
        audit(req, 'UPDATE', 'fraud_case', id, data);
        res.json({ success: true });
    } catch (error) {
        console.error('Update fraud case error:', error);
        res.status(500).json({ success: false, error: 'Failed to update fraud case' });
    }
});

// DELETE /api/v1/fraud/cases/:id
router.delete('/cases/:id', adminApiAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        fraudDb.deleteCase(id);
        audit(req, 'DELETE', 'fraud_case', id, null);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete fraud case error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete fraud case' });
    }
});

// POST /api/v1/fraud/cases/:id/actions — acknowledge / investigate / escalate / close / false_positive
router.post('/cases/:id/actions', adminApiAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { action, note } = req.body;
        if (!VALID_ACTIONS.includes(action)) {
            return res.status(400).json({ success: false, error: 'Invalid action' });
        }
        const statusMap = {
            acknowledge: 'open',
            investigate: 'investigating',
            escalate: 'escalated',
            close: 'closed',
            false_positive: 'false_positive'
        };
        fraudDb.updateCase(id, { status: statusMap[action] });
        if (note) {
            fraudDb.createNote({ fraudCaseId: id, adminId: getAdminIdFromToken(req), note: `${action}: ${note}` });
        }
        audit(req, action.toUpperCase(), 'fraud_case', id, { note });
        res.json({ success: true });
    } catch (error) {
        console.error('Fraud case action error:', error);
        res.status(500).json({ success: false, error: 'Failed to apply action' });
    }
});

// GET /api/v1/fraud/cases/:id/hops
router.get('/cases/:id/hops', adminApiAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const hops = fraudDb.getHopsByCase(id);
        res.json({ success: true, hops: hops.map(h => ({ ...h, evidenceJson: h.evidence_json ? JSON.parse(h.evidence_json) : null, isSanctioned: !!h.is_sanctioned })) });
    } catch (error) {
        console.error('Get fraud hops error:', error);
        res.status(500).json({ success: false, error: 'Failed to load hops' });
    }
});

// POST /api/v1/fraud/cases/:id/hops
router.post('/cases/:id/hops', adminApiAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        data.fraudCaseId = id;
        const result = fraudDb.createHop(data);
        audit(req, 'CREATE', 'fraud_hop', result.lastInsertRowid, { fraudCaseId: id });
        res.status(201).json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        console.error('Create fraud hop error:', error);
        res.status(500).json({ success: false, error: 'Failed to create hop' });
    }
});

// PATCH /api/v1/fraud/hops/:id
router.patch('/hops/:id', adminApiAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        fraudDb.updateHop(id, req.body);
        audit(req, 'UPDATE', 'fraud_hop', id, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Update fraud hop error:', error);
        res.status(500).json({ success: false, error: 'Failed to update hop' });
    }
});

// DELETE /api/v1/fraud/hops/:id
router.delete('/hops/:id', adminApiAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        fraudDb.deleteHop(id);
        audit(req, 'DELETE', 'fraud_hop', id, null);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete fraud hop error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete hop' });
    }
});

// GET /api/v1/fraud/cases/:id/accounts
router.get('/cases/:id/accounts', adminApiAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const accounts = fraudDb.getAccountsByCase(id);
        res.json({ success: true, accounts: accounts.map(a => ({ ...a, riskFlags: a.risk_flags ? JSON.parse(a.risk_flags) : [] })) });
    } catch (error) {
        console.error('Get fraud accounts error:', error);
        res.status(500).json({ success: false, error: 'Failed to load accounts' });
    }
});

// POST /api/v1/fraud/cases/:id/accounts
router.post('/cases/:id/accounts', adminApiAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        data.fraudCaseId = id;
        const result = fraudDb.createAccount(data);
        audit(req, 'CREATE', 'fraud_account', result.lastInsertRowid, { fraudCaseId: id });
        res.status(201).json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        console.error('Create fraud account error:', error);
        res.status(500).json({ success: false, error: 'Failed to create account' });
    }
});

// GET /api/v1/fraud/cases/:id/notes
router.get('/cases/:id/notes', adminApiAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const notes = fraudDb.getNotesByCase(id);
        res.json({ success: true, notes });
    } catch (error) {
        console.error('Get fraud notes error:', error);
        res.status(500).json({ success: false, error: 'Failed to load notes' });
    }
});

// POST /api/v1/fraud/cases/:id/notes
router.post('/cases/:id/notes', adminApiAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { note } = req.body;
        if (!note || typeof note !== 'string') {
            return res.status(400).json({ success: false, error: 'note string required' });
        }
        const result = fraudDb.createNote({ fraudCaseId: id, adminId: getAdminIdFromToken(req), note });
        audit(req, 'CREATE', 'fraud_note', result.lastInsertRowid, { fraudCaseId: id, note });
        res.status(201).json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        console.error('Create fraud note error:', error);
        res.status(500).json({ success: false, error: 'Failed to create note' });
    }
});

// GET /api/v1/fraud/stats/summary
router.get('/stats/summary', adminApiAuth, (req, res) => {
    try {
        const stats = fraudDb.getStats();
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Fraud stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to load stats' });
    }
});

// GET /api/v1/fraud/rules
router.get('/rules', adminApiAuth, (req, res) => {
    try {
        const rules = fraudDb.getRules({ enabled: req.query.enabled, limit: req.query.limit });
        res.json({ success: true, rules });
    } catch (error) {
        console.error('List fraud rules error:', error);
        res.status(500).json({ success: false, error: 'Failed to load rules' });
    }
});

// POST /api/v1/fraud/rules
router.post('/rules', adminApiAuth, (req, res) => {
    try {
        const data = req.body;
        if (!data.name || !data.conditionJson) {
            return res.status(400).json({ success: false, error: 'name and conditionJson required' });
        }
        const result = fraudDb.createRule({ ...data, createdBy: getAdminIdFromToken(req) });
        audit(req, 'CREATE', 'fraud_rule', result.lastInsertRowid, { name: data.name });
        res.status(201).json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        console.error('Create fraud rule error:', error);
        res.status(500).json({ success: false, error: 'Failed to create rule' });
    }
});

// PATCH /api/v1/fraud/rules/:id
router.patch('/rules/:id', adminApiAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        fraudDb.updateRule(id, req.body);
        audit(req, 'UPDATE', 'fraud_rule', id, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Update fraud rule error:', error);
        res.status(500).json({ success: false, error: 'Failed to update rule' });
    }
});

// DELETE /api/v1/fraud/rules/:id
router.delete('/rules/:id', adminApiAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        fraudDb.deleteRule(id);
        audit(req, 'DELETE', 'fraud_rule', id, null);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete fraud rule error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete rule' });
    }
});

// GET /api/v1/fraud/export/cases?format=xlsx|csv
router.get('/export/cases', adminApiAuth, async (req, res) => {
    try {
        const format = req.query.format === 'csv' ? 'csv' : 'xlsx';
        const filters = {
            status: req.query.status,
            priority: req.query.priority,
            category: req.query.category,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            minRisk: req.query.minRisk !== undefined ? parseFloat(req.query.minRisk) : undefined,
            maxRisk: req.query.maxRisk !== undefined ? parseFloat(req.query.maxRisk) : undefined,
            q: req.query.q,
            limit: 5000,
        };
        const result = fraudDb.getCases(filters);
        const caseIds = result.cases.map(c => c.id);

        const workbook = new ExcelJS.Workbook();
        workbook.created = new Date();
        workbook.creator = 'PSB SecureWealth Fraud Intelligence';

        const casesSheet = workbook.addWorksheet('Cases');
        casesSheet.columns = [
            { header: 'Case Ref', key: 'caseRef', width: 18 },
            { header: 'Status', key: 'status', width: 14 },
            { header: 'Priority', key: 'priority', width: 10 },
            { header: 'Category', key: 'category', width: 18 },
            { header: 'Risk Score', key: 'riskScore', width: 12 },
            { header: 'Summary', key: 'summary', width: 50 },
            { header: 'User Name', key: 'userName', width: 24 },
            { header: 'User Email', key: 'userEmail', width: 28 },
            { header: 'Assigned Admin', key: 'assignedAdmin', width: 18 },
            { header: 'Country Risk Tags', key: 'countryRiskTags', width: 30 },
            { header: 'Created At', key: 'createdAt', width: 20 },
            { header: 'Updated At', key: 'updatedAt', width: 20 },
        ];
        result.cases.forEach(c => casesSheet.addRow({
            caseRef: c.case_ref,
            status: c.status,
            priority: c.priority,
            category: c.category,
            riskScore: c.risk_score,
            summary: c.summary,
            userName: c.user_name || '',
            userEmail: c.user_email || '',
            assignedAdmin: c.assigned_admin_id || '',
            countryRiskTags: c.country_risk_tags || '',
            createdAt: c.created_at,
            updatedAt: c.updated_at,
        }));

        const hopsSheet = workbook.addWorksheet('Hops');
        hopsSheet.columns = [
            { header: 'Case Ref', key: 'caseRef', width: 18 },
            { header: 'Hop #', key: 'hopNumber', width: 8 },
            { header: 'Type', key: 'hopType', width: 14 },
            { header: 'Node', key: 'nodeName', width: 24 },
            { header: 'Country', key: 'country', width: 16 },
            { header: 'City', key: 'city', width: 18 },
            { header: 'Institution', key: 'institution', width: 26 },
            { header: 'Entity Type', key: 'entityType', width: 16 },
            { header: 'Entity Value', key: 'entityValue', width: 24 },
            { header: 'Amount', key: 'amount', width: 14 },
            { header: 'Currency', key: 'currency', width: 10 },
            { header: 'Timestamp', key: 'timestamp', width: 20 },
            { header: 'Confidence', key: 'confidence', width: 12 },
            { header: 'Sanctioned', key: 'isSanctioned', width: 12 },
        ];

        const accountsSheet = workbook.addWorksheet('Accounts');
        accountsSheet.columns = [
            { header: 'Case Ref', key: 'caseRef', width: 18 },
            { header: 'Account Type', key: 'accountType', width: 14 },
            { header: 'Holder Name', key: 'holderName', width: 24 },
            { header: 'Bank Name', key: 'bankName', width: 26 },
            { header: 'Branch', key: 'branch', width: 22 },
            { header: 'Masked Account', key: 'maskedAccount', width: 22 },
            { header: 'IFSC', key: 'ifsc', width: 16 },
            { header: 'SWIFT/BIC', key: 'swiftBic', width: 16 },
            { header: 'Country', key: 'country', width: 16 },
            { header: 'Risk Flags', key: 'riskFlags', width: 30 },
        ];

        const notesSheet = workbook.addWorksheet('Notes');
        notesSheet.columns = [
            { header: 'Case Ref', key: 'caseRef', width: 18 },
            { header: 'Admin', key: 'adminId', width: 18 },
            { header: 'Note', key: 'note', width: 60 },
            { header: 'Created At', key: 'createdAt', width: 20 },
        ];

        for (const c of result.cases) {
            const hops = fraudDb.getHopsByCase(c.id);
            hops.forEach(h => hopsSheet.addRow({
                caseRef: c.case_ref,
                hopNumber: h.hop_number,
                hopType: h.hop_type,
                nodeName: h.node_name,
                country: h.country,
                city: h.city,
                institution: h.institution,
                entityType: h.entity_type,
                entityValue: h.entity_value,
                amount: h.amount,
                currency: h.currency,
                timestamp: h.timestamp,
                confidence: h.confidence,
                isSanctioned: h.is_sanctioned ? 'Yes' : 'No',
            }));
            const accounts = fraudDb.getAccountsByCase(c.id);
            accounts.forEach(a => accountsSheet.addRow({
                caseRef: c.case_ref,
                accountType: a.account_type,
                holderName: a.holder_name,
                bankName: a.bank_name,
                branch: a.branch,
                maskedAccount: a.masked_account,
                ifsc: a.ifsc,
                swiftBic: a.swift_bic,
                country: a.country,
                riskFlags: a.risk_flags,
            }));
            const notes = fraudDb.getNotesByCase(c.id);
            notes.forEach(n => notesSheet.addRow({
                caseRef: c.case_ref,
                adminId: n.admin_id,
                note: n.note,
                createdAt: n.created_at,
            }));
        }

        if (format === 'csv') {
            const buffer = await workbook.csv.writeBuffer();
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="fraud-cases-${new Date().toISOString().slice(0, 10)}.csv"`);
            res.send(buffer);
        } else {
            const buffer = await workbook.xlsx.writeBuffer();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="fraud-cases-${new Date().toISOString().slice(0, 10)}.xlsx"`);
            res.send(buffer);
        }

        audit(req, 'EXPORT', 'fraud_cases', null, { format, count: result.cases.length });
    } catch (error) {
        console.error('Fraud export error:', error);
        res.status(500).json({ success: false, error: 'Failed to export fraud cases' });
    }
});

module.exports = router;
