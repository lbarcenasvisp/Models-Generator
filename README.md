# Models-Generator
A cli tool for generating sequelize models with the following code format:
```
import Sequelize from 'sequelize'
import {db} from '../../sequelize_connection.js'
db.define('aaatest', {
    field_1: {
        type:  Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        ...
    },
    ...
})
const tablenameModel = db.models.tablename;
export {tablenameModel};
```

## Installing

```
$ npm install -g models-generator
```

## Usage
Go to your project's root working directory.
Write in the terminal the following command.

```
$ generate -o FOLDER_NAME -d DB_NAME -h HOST -u USERNAME -p PORT -x PASS
```
