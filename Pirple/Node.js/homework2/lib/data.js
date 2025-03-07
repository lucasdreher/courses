/**
 * Library for storing and editing data
 * 
 */

const // Dependencies
	fs = require('fs'),
	path = require('path'),
	helpers = require('./helpers');

// Container for the module (to be exported)

const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = function(dir, file, data, callback) {
	// Open the file for writing
	fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', function(err, fileDescriptor) {
		if (!err && fileDescriptor) {
			// Convert data to string
			const stringData = JSON.stringify(data);

			// Write to file and close it
			fs.writeFile(fileDescriptor, stringData, function(err) {
				if (!err) {
					fs.close(fileDescriptor, function(err) {
						if (!err) {
							callback(false);
						} else {
							callback('Error closing new file');
						}
					});
				} else {
					callback('Error writing to new file');
				}
			});
		} else {
			callback('Could not create new file, it may already exist');
		}
	});
};

// Read data from  file
lib.read = function(dir, file, callback) {
	fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf8', function(err, data) {
		if (!err && data) {
			const parsedData = helpers.parseJsonToObject(data);
			callback(false, parsedData);
		} else {
			callback(err, data);
		}
	});
};

// Update data inside a file
lib.update = function(dir, file, data, callback) {
	// Open the file from writing
	fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', function(err, fileDescriptor) {
		if (!err && fileDescriptor) {
			// Convert data to string
			const stringData = JSON.stringify(data);

			// Truncate the file
			fs.ftruncate(fileDescriptor, function(err) {
				if (!err) {
					//Write to the file and close it
					fs.writeFile(fileDescriptor, stringData, function(err) {
						if (!err) {
							fs.close(fileDescriptor, function(err) {
								if (!err) {
									callback(false);
								} else {
									callback('Error closing existing file');
								}
							});
						} else {
							callback('Error writing to existing file');
						}
					});
				} else {
					callback('Error truncating file');
				}
			});
		} else {
			callback('Could not open the file for updating, it may not exist yet');
		}
	});
};

// Delete a file
lib.delete = function(dir, file, callback) {
	// Unlink the file
	fs.unlink(`${lib.baseDir}${dir}/${file}.json`, function(err) {
		if (!err) {
			callback(false);
		} else {
			callback('Error deleting file');
		}
	});
};

// List all the items in a directory
lib.list = function(dir, callback) {
	fs.readdir(`${lib.baseDir}${dir}/`, function(err, data) {
		if (!err && data && data.length > 0) {
			const trimmedFileNames = [];
			data.forEach((fileName) => {
				trimmedFileNames.push(fileName.replace('.json', ''));
			});
			callback(false, trimmedFileNames);
		} else {
			callback(err, data);
		}
	});
};

// Export the module
module.exports = lib;
