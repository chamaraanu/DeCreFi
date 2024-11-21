import * as fs from 'fs';

export function writeJsonToFile(filePath: string, jsonData: any): void {
    const jsonString = JSON.stringify(jsonData, null, 2); // Pretty print with 2 spaces
    fs.writeFile(filePath, jsonString, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log('JSON written to file successfully.');
      }
    });
}

export function appendJsonToFile(filePath: string, newData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      // Step 1: Read the existing file
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject('Error reading file: ' + err);
          return;
        }
  
        let jsonData;
  
        try {
          // Step 2: Parse the existing JSON data
          jsonData = JSON.parse(data);
        } catch (parseError) {
          reject('Error parsing JSON: ' + parseError);
          return;
        }
  
        // Step 3: Append new data (assuming both are objects)
        Object.assign(jsonData, newData); // For objects
  
        // Step 4: Write the updated JSON back to the file
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
          if (writeErr) {
            reject('Error writing to file: ' + writeErr);
          } else {
            resolve();
          }
        });
      });
    });
  }

export function readJsonFromFile(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject('Error reading file: ' + err);
          return;
        }
  
        try {
          const jsonData = JSON.parse(data); // Parse JSON data
          resolve(jsonData); // Return the parsed data
        } catch (parseError) {
          reject('Error parsing JSON: ' + parseError);
        }
      });
    });
  }