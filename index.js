#!/usr/bin/env node

var shell = require('shelljs');
var chalk = require('chalk');
var exec = require('child_process').execSync;
var path = require('path');
var fs = require('fs');
var program = require('commander');

var localPath = path.join(__dirname, '.bin');
localPath = path.join(localPath, 'sequelize-auto');

var converter = function(fileContent, filename, mode){
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
    modelName = modelName.join("") + "Model";
    file = "import Sequelize from 'sequelize'\n";
    file += "import {db} from '../../sequelize_connection.js'\n";
    file += "db.define('"+fname+"', {\n";
    file += object + "\n";
    file += "\t}, {\n";
    file += "\t\ttableName: '"+fname+"'\n";
    file += "\t})\n";
    file += "const "+modelName+" = db.models."+fname+";\n";
    file += "export {"+modelName+"};";

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
    .parse(process.argv);

const executableCommand = `${localPath} -o ${program.output} -h ${program.host} -d ${program.database} -u ${program.username} -p ${program.port} -x ${program.password} -e mysql`;
shell.exec(executableCommand);

var modelsPath = path.join(__dirname, program.output);
var modelsDir = fs.readdirSync(modelsPath);

modelsDir.forEach(function(filename){
    var segments = filename.replace('.js', '').split('_');
    var modelName = segments.map(function(element){
        return element.replace(element[0], element[0].toUpperCase())
    });
    modelName = modelName.join('') + 'Model.js';
    fs.renameSync(path.join(modelsPath, filename), path.join(modelsPath, modelName));

    var fileContent = fs.readFileSync(path.join(modelsPath, modelName), 'utf-8');
    fileContent = converter(fileContent, filename, 'd');
    console.log(chalk.yellow(`converting ${filename}...`));

    fs.writeFileSync(path.join(modelsPath, modelName), fileContent, {encoding: 'utf-8'});
});
