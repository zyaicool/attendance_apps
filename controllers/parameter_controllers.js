const Parameter = require('../models/parameters')
const redisClient = require('../config/redis_client');

exports.updateParameter = async(req, res) => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        const { parameterValue } = req.body;
        const parameterId = req.params.id
        const getParameter = await Parameter.findOne({ where: { id: parameterId, deleted_at: null } });
        if (!getParameter) {
            return res.status(404).json({ response_message: 'Parameter not found' });
        }

        updated_by = 99
        const [rowsUpdated] = await Parameter.update({
                parameter_name: getParameter.parameter_name,
                parameter_value: parameterValue,
                updated_by
            }, { where: { id: parameterId } } // ✅ Required condition
        );

        const updatedParameter = await Parameter.findOne({ where: { id: parameterId } });

        await redisClient.set(`parameter:${updatedParameter.parameterName}`, JSON.stringify({
            id: updatedParameter.id,
            parameter_name: updatedParameter.parameter_name,
            parameter_nalue: updatedParameter.parameter_value
        }));
        res.status(200).json({ response_message: "Success" });
    } catch (err) {
        res.status(500).json({ response_message: err.message });
    }
}

exports.getParameters = async(req, res) => {
    try {
        let { page, limit, search } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        const whereClause = { deleted_at: null };
        if (search) {
            whereClause.parameter_name = {
                [Op.like]: `%${search}%`
            };
        }

        const parameters = await Parameter.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'parameter_name', 'parameter_value'],
            limit,
            offset
        });

        res.status(200).json({
            total: parameters.count,
            page,
            limit,
            parameters: parameters.rows.map(parameter => ({
                id: parameter.id,
                parameter_name: parameter.parameter_name,
                parameter_value: parameter.parameter_value
            }))
        });
    } catch (error) {
        res.status(500).json({ response_message: error.message });
    }
};

exports.getParameterById = async(req, res) => {
    try {
        const parameter = await Parameter.findOne({
            where: { id: req.params.id, deleted_at: null },
            attributes: ['id', 'parameter_name', 'parameter_value']
        });
        if (!parameter) {
            return res.status(404).json({ response_message: 'User not found' });
        }
        res.status(200).json(parameter);
    } catch (error) {
        res.status(500).json({ response_message: error.message });
    }
};