export enum ProfileField {
  firstName = 1,
  lastName = 2,
  createdAt = 5,
  updatedAt = 6,
  photoHash = 7,
  isRejected = 8,
  email = 9,
}

export enum UserRole {
  ACC_ADMIN_ROLE = '0xc033abfd55824014bedd81e89720ddd97a7afbe22d42e46ad139cecc93ca05bb',
  ACC_ROLE = '0x87c06c5ed5bb77b5aa1cfb1942ec198ae26b599618c73edf72eaf080a11deca1',
  // DEFAULT_ADMIN_ROLE = '0x1effbbff9c66c5e59634f24fe842750c60d18891155c32dd155fc2d661a4c86d',
  EDITOR_ADMIN_ROLE = '0xd44b074aa73c054adce7c2d38d50ec29ad2bf46e73799326d13afccb51762972',
  EDITOR_ROLE = '0x21d1167972f621f75904fb065136bc8b53c7ba1c60ccd3a7758fbee465851e9c',
  GEDITOR_ADMIN_ROLE = '0x9abb92c4fa448507d15251e4523d0644b513a5efb83a22450a1001733825c6ee',
  GEDITOR_ROLE = '0x90a35201266eb0940289e6e07530d0e97fef65e6e17cf6cb02721063f5be4b51',
  REGISTERED = '0xa9b291911b63603bb2d8ff28cdacaead35da60689f181aeada622b432b4a6f2d',
  ROOT_ADMIN_ROLE = '0x77ccc78fff97648b6361d5a6f0bd0a9f7c43fd29c1369941d3474c71311418fc',
  USEREDIT_ROLE = '0xaaeb92ba6a008dd9d43ba8c6746509313c3dca1871c0828610c8628f0f1048c5',
  VERIFIED_USER = '0x3e367f60f8b9d6961fa5c6517ce2b836b5fcc53aa1cf05f73d4b96fdd84a17e7',
  VERIFIER_ADMIN_ROLE = '0xb194a0b06484f8a501e0bef8877baf2a303f803540f5ddeb9d985c0cd76f3e70',
  VERIFIER_ROLE = '0x0ce23c3e399818cfee81a7ab0880f714e53d7672b08df0fa62f2843416e1ea09',
  LOCKED_USER = '0x0c01f8fdd27ccba87e8f18dced185f2d9889a0bfc5821dece64e08afef63f1fe',
}