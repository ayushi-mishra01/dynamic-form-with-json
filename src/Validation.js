const Validation = (fields, formData) => {
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];

        // Validate based on SQL Server data types
        switch (field.dataType.toLowerCase()) {
            case 'int32':
            case 'int64':
                if (!Number.isInteger(parseInt(formData[field.name]))) {
                    return `Enter valid integer for ${field.name}`;
                }
                break;
            case 'decimal':
            case 'single':
                if (isNaN(parseFloat(formData[field.name]))) {
                    return `Enter valid decimal for ${field.name}`;
                }
                break;
            case 'datetime':
                if (isNaN(Date.parse(formData[field.name]))) {
                    return `Enter valid datetime for ${field.name}`;
                }
                break;
            case 'char':
            case 'varchar':
            case 'nvarchar':
                if (typeof formData[field.name] !== 'string') {
                    return `Enter valid string for ${field.name}`;
                }
                break;
            case 'bit':
                const bitValue = formData[field.name];
                if (bitValue !== 0 && bitValue !== 1 && bitValue !== true && bitValue !== false) {
                    return `Enter valid boolean (0, 1, true, or false) for ${field.name}`;
                }
                break;
            case 'boolean':
                const booltValue = formData[field.name];
                if (booltValue !== true && booltValue !== false && booltValue !== "true" && booltValue !== "false") {
                    return `Enter valid boolean (true, or false) for ${field.name}`;
                }
                break;
            case 'tinyint':
                const intValue = parseInt(formData[field.name]);
                if (!Number.isInteger(intValue) || intValue < 0 || intValue > 255) {
                    return `Enter valid tinyint (0 to 255) for ${field.name}`;
                }
                break;
            case 'smallint':
                const smallIntValue = parseInt(formData[field.name]);
                if (!Number.isInteger(smallIntValue) || smallIntValue < -32768 || smallIntValue > 32767) {
                    return `Enter valid smallint (-32768 to 32767) for ${field.name}`;
                }
                break;
            case 'bigint':
                const bigIntValue = parseInt(formData[field.name]);
                if (!Number.isInteger(bigIntValue) || bigIntValue < -9223372036854775808 || bigIntValue > 9223372036854775807) {
                    return `Enter valid bigint (-9223372036854775808 to 9223372036854775807) for ${field.name}`;
                }
                break;
            case 'money':
                if (isNaN(parseFloat(formData[field.name]))) {
                    return `Enter valid money for ${field.name}`;
                }
                break;
            case 'float':
            case 'real':
                if (isNaN(parseFloat(formData[field.name]))) {
                    return `Enter valid float/real for ${field.name}`;
                }
                break;
            case 'date':
            case 'datetime2':
            case 'smalldatetime':
            case 'time':
            case 'datetimeoffset':
                if (isNaN(Date.parse(formData[field.name]))) {
                    return `Enter valid date/time for ${field.name}`;
                }
                break;
            case 'binary':
            case 'varbinary':
            case 'image':
                if (!Buffer.isBuffer(formData[field.name])) {
                    return `Enter valid binary data for ${field.name}`;
                }
                break;
            default:
                break;
        }
    }

    return "";
};

export default Validation;