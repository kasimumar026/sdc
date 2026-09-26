export function getNetworkProvider(phoneNumber: string): string {
  // Normalize: strip spaces, dashes, and country code
  let number = phoneNumber.replace(/[\s-]/g, '');

  if (number.startsWith('+234')) {
    number = '0' + number.slice(4);
  } else if (number.startsWith('234')) {
    number = '0' + number.slice(3);
  }

  if (!/^0\d{10}$/.test(number)) {
    return 'Invalid number';
  }

  const prefix = number.slice(0, 4);

  const networks = {
    MTN: [
      '0803', '0806', '0703', '0706', '0813', '0814', '0816',
      '0810', '0813', '0903', '0906', '0913', '0916'
    ],
    Airtel: [
      '0802', '0808', '0708', '0812', '0701', '0902', '0901',
      '0904', '0907', '0912'
    ],
    Glo: [
      '0805', '0807', '0705', '0815', '0811', '0905', '0915'
    ],
    '9mobile': [
      '0809', '0817', '0818', '0908', '0909'
    ]
  };

  for (const [network, prefixes] of Object.entries(networks)) {
    if (prefixes.includes(prefix)) {
      return network;
    }
  }

  return 'Unknown network';
}

