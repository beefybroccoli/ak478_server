
// source :http://www.levigross.com/2014/03/30/how-to-write-an-encrypt-and-decrypt-api-for-data-at-rest-in-nodejs/

const crypto = require('crypto');
const algorithm = 'AES-256-CBC';
const hmac_algorithm = 'SHA256';
const private_key = crypto.randomBytes(32);
const hmac_key = crypto.randomBytes(32);


/* Encrypt
 * input : privatekey.pem, string message
 * output : ciphertext
 */
var encrypt = function (message){
    
    var IV = new Buffer(crypto.randomBytes(16));
    var cipher_text, hmac, encryptor;

    // initialize an RSA object (OAEP only)
    //use the RSA object to load public key
    encryptor = crypto.createCipheriv(algorithm, private_key, IV);
    encryptor.setEncoding('hex');
    encryptor.write(message);
    encryptor.end();
    
    cipher_text = encryptor.read();
    
    hmac = crypto.createHmac(hmac_algorithm, hmac_key);
    hmac.update(cipher_text);
    hmac.update(IV.toString('hex')); //ensure both IV and the cipher text is protected by the HMAC
    
    return cipher_text + "$" + IV.toString('hex') + "$" + hmac.digest('hex');

}


/* Decrypt
 * input : a JSON object with keys (RSA ciphertext, AES ciphertext, HMAC tag, a file path to an RSA private key)
 */


var decrypt = function(ciphertext){
    var cipher_blocks = ciphertext.split("$");
    var cipher_text = cipher_blocks[0];
    var IV = new Buffer(cipher_blocks[1], 'hex');
    var hmac = cipher_blocks[2];
    
    
    var chmac = crypto.createHmac(hmac_algorithm, hmac_key);
    chmac.update(cipher_text);
    chmac.update(IV.toString('hex'));
    
    if (!constant_time_compare(chmac.digest('hex'), hmac)) {
        console.log("Encrypted Blob has been tampered with...");
        return null;
    }
    
    var decryptor = crypto.createDecipheriv(algorithm, private_key, IV );
    var decryptedText = decryptor.update(cipher_text, 'hex', 'utf-8');
    return decryptedText + decryptor.final('utf-8');
}

var constant_time_compare = function (val1, val2) {
    var sentinel;

    if (val1.length !== val2.length) {
        return false;
    }


    for (var i = 0; i <= (val1.length - 1); i++) {
        sentinel |= val1.charCodeAt(i) ^ val2.charCodeAt(i);
    }

    return sentinel === 0
};


var message = "hello world";
console.log("unencrypted text: " + message);
var cipherText = encrypt(message);
console.log(cipherText);
var decryptText = decrypt(cipherText);
console.log("decrypted text: " + decryptText);
