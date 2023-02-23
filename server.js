const axios = require('axios');

const express = require('express');
const { body } = require('express-validator');
const app = express();
const port = 3000;

const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'sample',
    port: 3306,
    connectionLimit: 5
});

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Orders API',
            version: '1.0.0',
            description: 'API for the orders database'
        },
        host: 'localhost:3000',
        basePath: '/'
    },
    apis: ['./server.js']
};
const specs = swaggerJsDoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors());

app.use(express.json());

/**
 * @swagger
 *     components:
 *         schemas:
 *             Agent:
 *                 type: object
 *                 properties:
 *                     AGENT_CODE:
 *                         type: string
 *                     AGENT_NAME:
 *                         type: string
 *                     WORKING_AREA:
 *                         type: string
 *                     COMMISSION:
 *                         type: number
 *                         format: float
 *                     PHONE_NO:
 *                         type: string
 *                     COUNTRY:
 *                         type: string
 *             Customer:
 *                 type: object
 *                 properties:
 *                     CUST_CODE:
 *                         type: string
 *                     CUST_NAME:
 *                         type: string
 *                     WORKING_AREA:
 *                         type: string
 *                     CUST_COUNTRY:
 *                         type: string
 *                     GRADE:
 *                         type: integer
 *                     OPENING_AMT:
 *                         type: number
 *                         format: float
 *                     RECEIVE_AMT:
 *                         type: number
 *                         format: float
 *                     PAYMENT_AMT:
 *                         type: number
 *                         format: float
 *                     OUTSTANDING_AMT:
 *                         type: number
 *                         format: float
 *                     PHONE_NO:
 *                         type: string
 *                     AGENT_CODE:
 *                         type: string
 *             Order:
 *                 type: object
 *                 properties:
 *                     ORD_NUM:
 *                         type: integer
 *                     ORD_AMOUNT:
 *                         type: number
 *                         format: float
 *                     ADVANCE_AMOUNT:
 *                         type: number
 *                         format: float
 *                     ORD_DATE:
 *                         type: string
 *                         format: date
 *                     CUST_CODE:
 *                         type: string
 *                     AGENT_CODE:
 *                         type: string
 *                     ORD_DESCRIPTION:
 *                         type: string
 */

/**
 * @swagger
 * /agents:
 *    get:
 *        summary: Return all agents
 *        description: Return all agents
 *        responses:
 *             200:
 *                description: Array of agent objects
 *                content:
 *                    application/json:
 *                        schema:
 *                            type: array
 *                            items:
 *                                $ref: '#components/schemas/Agent'
 */
app.get('/agents', (req, res) => {
    pool.query('SELECT * FROM agents')
    .then(rows => {
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.json(rows);
    })
    .catch(err => {
        console.log(err);
    });
});

/**
 * @swagger
 * /agents:
 *    post:
 *        summary: Create agent
 *        description: Create agent
 *        requestBody:
 *            required: true
 *            content:
 *                application/json:
 *                    schema:
 *                        $ref: '#components/schemas/Agent'
 *        responses:
 *             201:
 *                description: Agent object created
 *             400:
 *                description: Agent object not created
 */
app.post('/agents',
        body('AGENT_CODE').not().isEmpty().trim().escape(),
        body('AGENT_NAME').trim().escape(),
        body('WORKING_AREA').trim().escape(),
        body('COMMISSION').isDecimal().trim().escape(),
        body('PHONE_NO').trim().escape(),
        body('COUNTRY').trim().escape(),
        (req, res) => {
            const { AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY } = req.body;
            pool.query('INSERT INTO agents VALUES (?, ?, ?, ?, ?, ?)', [AGENT_CODE, AGENT_NAME,
                        WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY])
            .then(rows => {
                if (rows.affectedRows > 0) {
                    res.status(201).send();
                }
                else {
                    res.status(400).send();
                }
            })
            .catch(err => {
                console.log(err);
            });
});

/**
 * @swagger
 * /agents/{agentCode}:
 *    patch:
 *        summary: Update agent
 *        description: Update agent
 *        parameters:
 *            - in: path
 *              name: agentCode
 *              required: true
 *              description: Agent code required
 *              schema:
 *                  type: string
 *        requestBody:
 *            required: true
 *            content:
 *                application/json:
 *                    schema:
 *                        $ref: '#components/schemas/Agent'
 *        responses:
 *             200:
 *                description: Agent object updated
 *             400:
 *                description: Agent object not updated
 */
app.patch('/agents/:agentCode',
        body('AGENT_CODE').not().isEmpty().trim().escape(),
        body('AGENT_NAME').trim().escape(),
        body('WORKING_AREA').trim().escape(),
        body('COMMISSION').isDecimal().trim().escape(),
        body('PHONE_NO').trim().escape(),
        body('COUNTRY').trim().escape(),
        (req, res) => {
            const { AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY } = req.body;
            pool.query(`UPDATE agents SET AGENT_CODE = "${AGENT_CODE}", AGENT_NAME = "${AGENT_NAME}",
                        WORKING_AREA = "${WORKING_AREA}", COMMISSION = ${COMMISSION}, PHONE_NO = "${PHONE_NO}", 
                        COUNTRY = "${COUNTRY}" WHERE AGENT_CODE = "${req.params.agentCode}"`)
            .then(rows => {
                if (rows.affectedRows > 0) {
                    res.status(200).send();
                }
                else {
                    res.status(400).send();
                }
            })
            .catch(err => {
                console.log(err);
            });
});

/**
 * @swagger
 * /agents/{agentCode}:
 *    put:
 *        summary: Update agent or create agent if not found
 *        description: Update agent or create agent if not found
 *        parameters:
 *            - in: path
 *              name: agentCode
 *              required: true
 *              description: Agent code required
 *              schema:
 *                  type: string
 *        requestBody:
 *            required: true
 *            content:
 *                application/json:
 *                    schema:
 *                        $ref: '#components/schemas/Agent'
 *        responses:
 *             200:
 *                description: Agent object updated
 *             201:
 *                description: Agent object created
 *             400:
 *                description: Agent object neither updated nor created
 */
app.put('/agents/:agentCode',
        body('AGENT_CODE').not().isEmpty().trim().escape(),
        body('AGENT_NAME').trim().escape(),
        body('WORKING_AREA').trim().escape(),
        body('COMMISSION').isDecimal().trim().escape(),
        body('PHONE_NO').trim().escape(),
        body('COUNTRY').trim().escape(),
        (req, res) => {
            const { AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY } = req.body;
            pool.query(`UPDATE agents SET AGENT_CODE = "${AGENT_CODE}", AGENT_NAME = "${AGENT_NAME}",
                        WORKING_AREA = "${WORKING_AREA}", COMMISSION = ${COMMISSION}, PHONE_NO = "${PHONE_NO}", 
                        COUNTRY = "${COUNTRY}" WHERE AGENT_CODE = "${req.params.agentCode}"`)
            .then(rows => {
                if (rows.affectedRows > 0) {
                    res.status(200).send();
                }
                else {
                    pool.query('INSERT INTO agents VALUES (?, ?, ?, ?, ?, ?)', [AGENT_CODE, AGENT_NAME, WORKING_AREA,
                                COMMISSION, PHONE_NO, COUNTRY])
                    .then(rows => {
                        if (rows.affectedRows > 0) {
                            res.status(201).send();
                        }
                        else {
                            res.status(400).send();
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
                }
            })
            .catch(err => {
                console.log(err);
            });
});

/**
 * @swagger
 * /agents/{agentCode}:
 *    delete:
 *        summary: Delete agent
 *        description: Delete agent
 *        parameters:
 *            - in: path
 *              name: agentCode
 *              required: true
 *              description: Agent code required
 *              schema:
 *                  type: string
 *        responses:
 *             200:
 *                description: Agent object deleted
 *             400:
 *                description: Agent object not deleted
 */
app.delete('/agents/:agentCode', (req, res) => {
    pool.query(`DELETE FROM agents WHERE AGENT_CODE = "${req.params.agentCode}"`)
    .then(rows => {
        if (rows.affectedRows > 0) {
            res.status(200).send();
        }
        else {
            res.status(400).send();
        }
    })
    .catch(err => {
        console.log(err);
    });
});

/**
 * @swagger
 * /customers:
 *    get:
 *        summary: Return all customers
 *        description: Return all customers
 *        responses:
 *             200:
 *                description: Array of customer objects
 *                content:
 *                    application/json:
 *                        schema:
 *                            type: array
 *                            items:
 *                                $ref: '#components/schemas/Customer'
 */
app.get('/customers', (req, res) => {
    pool.query('SELECT * FROM customer')
    .then(rows => {
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.json(rows);
    })
    .catch(err => {
        console.log(err);
    });
});

/**
* @swagger
* /orders:
*    get:
*        summary: Return all orders
*        description: Return all orders
*        responses:
*             200:
*                description: Array of order objects
*                content:
*                    application/json:
*                        schema:
*                            type: array
*                            items:
*                                $ref: '#components/schemas/Order'
*/
app.get('/orders', (req, res) => {
    pool.query('SELECT * FROM orders')
    .then(rows => {
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.json(rows);
    })
    .catch(err => {
        console.log(err);
    });
});

app.get('/say', (req, res) => {
    axios.post('https://3mb3x8hnuc.execute-api.us-east-2.amazonaws.com/default/my-function', {keyword: req.query.keyword})
    .then(response => {
        res.send(response.data);
    })
    .catch(err => {
        console.log(err);
    });
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});