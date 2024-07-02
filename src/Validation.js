const Validation=(fields, formData)=>{

    fields.forEach(field => {
        if (!formData[field.name] && !field.isNullable) {
            return "Enter the details";
        }
        switch (field.dataType) {
            case 'Int32':
            case 'Int64':
                if (!Number.isInteger(parseInt(formData[field.name]))) {
                    return "Enter valid integer for "+ field.name;
                }
                break;
            case 'Decimal':
            case 'Single':
                if (isNaN(parseFloat(formData[field.name]))) {
                    return "Enter valid decimal for "+ field.name;
                }
                break;
            case 'DateTime':
                if (isNaN(Date.parse(formData[field.name]))) {
                    return "Enter valid datetime for "+ field.name;
                }
                break;
            default:
                break;
        }
    });

    return "";
}

export default Validation;