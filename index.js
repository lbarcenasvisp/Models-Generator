#!/usr/bin/env node

var shell = require('shelljs');
var chalk = require('chalk');
var path = require('path');
var fs = require('fs');
var program = require('commander');
var pkgDir = require('pkg-dir');

var localPath = '';
pkgDir(__dirname).then(rootDir => {
    localPath = rootDir;
})
localPath = path.join(localPath, 'node_modules/.bin/sequelize-auto');

var converter = function(fileContent, filename, mode, readonly){
    var fname = filename;
    if(fname.includes('.js')){
        fname = fname.substring(0, fname.indexOf('.js'));
    }

    var fileLines = fileContent.split('\n');
    var objects = fileLines.slice(4, fileLines.length - 5);

    var file = ""

    var object = objects.join('\n').replace(/DataTypes/g, "Sequelize").replace(/sequelize/g, "db");
    var segments = fname.split('_');
    var modelName = segments.map(function(element){
        return element.replace(element[0], element[0].toUpperCase());
    })
    var readOnlyModelName = ""

    modelName = modelName.join("") + "Model";
    if (readonly) {
        readOnlyModelName = modelName.join("") + "ReadOnlyModel";
    }

    const dbImport = readonly ? "db, dbReadOnly" : "db";

    file = "import Sequelize from 'sequelize'\n";
    file += "import {"+dbImport+"} from '~/data/sequelize_connection'\n";
    file += "db.define('"+fname+"', {\n";
    file += object + "\n";
    file += "\t}, {\n";
    file += "\t\ttableName: '"+fname+"'\n";
    file += "\t})\n";

    if (readonly) {
        file += "dbReadOnly.define('"+fname+"', {\n";
        file += object + "\n";
        file += "\t}, {\n";
        file += "\t\ttableName: '"+fname+"'\n";
        file += "\t})\n";
        
    }

    file += "const "+modelName+" = db.models."+fname+";\n";
    if (readonly) {
        file += "const "+readOnlyModelName+" = dbReadOnly.models."+fname+";\n";
    }

    const modelExport = readonly ? modelName + ", " + readOnlyModelName : modelName;

    file += "export { "+modelExport+" };";

    return file;
}

shell.echo(chalk.green("Generating models, please be patient..."));

program
    .option('-d, --database <database>', 'The name of the database')
    .option('-o, --output <output>', 'The path where the models will be place after generation')
    .option('-h, --host <host>', 'The domain hosting the database')
    .option('-u, --username <username>', 'The username of the database')
    .option('-p, --port <port>', 'The port being used by the database in the domain')
    .option('-x, --password <password>', 'The password of the database')
    .option('-r, --readonly <readonly>', 'Readonly db property. 0 or 1 values only. 1 means use readonly. 0 if otherwise. Defaults to 0.')
    .parse(process.argv);

var modelsPath = path.join(process.cwd(), program.output);

const executableCommand = `${localPath} -o ${program.output} -h ${program.host} -d ${program.database} -u ${program.username} -p ${program.port} -x ${program.password} -e mysql`;
shell.exec(executableCommand, {async: false});

var modelsDir = fs.readdirSync(modelsPath);    

const readonly = program.readonly === 1 || program.readonly == "1";

modelsDir.forEach(function(filename){
    var segments = filename.replace('.js', '').split('_');
    var modelName = segments.map(function(element){
        return element.replace(element[0], element[0].toUpperCase())
    });
    modelName = modelName.join('') + 'Model.js';
    fs.renameSync(path.join(modelsPath, filename), path.join(modelsPath, modelName));

    var fileContent = fs.readFileSync(path.join(modelsPath, modelName), 'utf-8');
    fileContent = converter(fileContent, filename, 'd', readonly);
    console.log(chalk.yellow(`converting ${filename}...`));

    fs.writeFileSync(path.join(modelsPath, modelName), fileContent, {encoding: 'utf-8'});
});
