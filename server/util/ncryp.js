import Blind from 'blind'
import config from '@/config/environment'

export default class {
  static encryptField (value) {
    let encrypted = new Blind({ encryptKey: config.encryptKey }).encrypt(value)
    return encrypted
  }

  static decryptField (encryptedValue) {
    var decrypted = new Blind({ encryptKey: config.encryptKey }).decrypt(encryptedValue)
    return decrypted
  }
}
