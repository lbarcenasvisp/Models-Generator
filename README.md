# Models-Generator
A cli tool for generating sequelize models from a mysql database with the following code format:
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
- **db** : A sequelize instance containing the  mysql database credentials for your project
- **tablename** : Table name from your mysql database

## Installing
Must have installed [mysql](https://www.npmjs.com/package/mysql) globally

```
$ npm install -g models-generator-2
```

## Usage
Go to your project's root working directory.
Write in the terminal the following command.

```
$ generate -o FOLDER_NAME -d DB_NAME -h HOST -u USERNAME -p PORT -x PASS
```

## Future Plans
- Add output formatter, contrary to the current default format
- Ability to choose a single file for generating
