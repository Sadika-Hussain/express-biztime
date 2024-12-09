const express = require('express');
const router = express.Router();
const ExpressError = require("../expressError");
const db = require("../db");

// Returns a list of invoices
router.get("/", async function (req, res, next) {
    try {
        const results = await db.query(`SELECT * FROM invoices`);

        return res.json({ invoices: results.rows });
    } catch (err) {
        return next(err);
    }
});

// Returns details of a specific invoice
router.get("/:id", async function (req, res, next) {
    try {
        const id = req.params.id;

        const results = await db.query(
            `SELECT 
                i.id, 
                i.amt, 
                i.paid, 
                i.add_date, 
                i.paid_date, 
                c.code, 
                c.name, 
                c.description
             FROM invoices i
             JOIN companies c ON i.comp_code = c.code
             WHERE i.id = $1`,
            [id]
        );

        // Check if the invoice exists
        if (results.rows.length === 0) {
            throw new ExpressError(`Invoice with ID '${id}' not found`, 404);
        }

        // Extract the first row (since ID is unique, there will be only one row)
        const row = results.rows[0];

        // Build and return the response object
        return res.json({
            invoice: {
                id: row.id,
                amt: row.amt,
                paid: row.paid,
                add_date: row.add_date,
                paid_date: row.paid_date,
                company: {
                    code: row.code,
                    name: row.name,
                    description: row.description,
                },
            },
        });
    } catch (err) {
        return next(err);
    }
});

// Adds a new invoice and returns its details
router.post("/", async function (req, res, next) {
    try {
        const { comp_code, amt } = req.body;

        // Validate the amount
        if (amt <= 0) {
            throw new ExpressError("Amount must be a positive number", 400);
        }

        // Check if the company exists
        const companyResult = await db.query(`SELECT 1 FROM companies WHERE code=$1`, [comp_code]);

        if (companyResult.rows.length === 0) {
            throw new ExpressError(`Company with code '${comp_code}' not found`, 404);
        }

        // Insert the new invoice
        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt)
             VALUES ($1, $2)
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]
        );

        return res.status(201).json({ invoice: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

// Updates an existing invoice and returns the updated details
router.put("/:id", async function (req, res, next) {
    try {
        const id = req.params.id;
        const { amt } = req.body;

        // Validate the amount
        if (amt <= 0) {
            throw new ExpressError("Amount must be a positive number", 400);
        }

        const results = await db.query(
            `UPDATE invoices SET amt=$1
             WHERE id = $2
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, id]
        );

        if (results.rows.length === 0) {
            throw new ExpressError(`Invoice with ID '${id}' not found`, 404);
        }

        return res.json({ invoice: results.rows[0] });
    } catch (err) {
        return next(err);
    }
});

// Deletes an invoice
router.delete("/:id", async function (req, res, next) {
    try {
        const id = req.params.id;
        const results = await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING 1`, [id]);

        if (results.rows.length === 0) {
            throw new ExpressError(`Invoice with ID '${id}' not found`, 404);
        }

        return res.json({ status: "deleted" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
