'use strict';

const binutils = require('binutils64');
const Codec = require('./codec');

/**
 * Codec 8 decoding
 */
class Codec8e extends Codec {
  /**
   * Trip event id's
   *
   * @returns {number}
   * @constructor
   */
  static get TRIP_EVENT_ID() {
    return 250;
  }

  /**
   * Trip start flag
   *
   * @returns {number}
   * @constructor
   */
  static get TRIP_EVENT_START() {
    return 1;
  }

  /**
   * Trip end flag
   *
   * @returns {number}
   * @constructor
   */
  static get TRIP_EVENT_END() {
    return 0;
  }

  /**
   * Odometer property id
   *
   * @returns {number}
   * @constructor
   */
  static get ODOMETER_PROPERTY_ID() {
    return 16;
  }

  /**
   * Codec 8 construct
   *
   * @param reader
   * @param number_of_records
   */
  constructor(reader, number_of_records) {
    super(reader, number_of_records);
    this._gpsPrecision = 10000000;
  }

  /**
   * Parsing AVL record header
   */
  parseHeader() {
    this.avlObj.records = [];

    for (var i = 0; i < this.number_of_records; i++) {
      this.parseAvlRecords();
    }
  }

  /**
   * Parse single AVL record
   */
  parseAvlRecords() {
    let avlRecord = {
      timestamp: new Date(this.toInt(this.reader.ReadBytes(8))),
      priority: this.toInt(this.reader.ReadBytes(1)),
      gps: {
        longitude: this.reader.ReadInt32(),
        latitude: this.reader.ReadInt32(),
        altitude: this.reader.ReadInt16(),
        angle: this.reader.ReadInt16(),
        satellites: this.reader.ReadInt8(),
        speed: this.reader.ReadInt16(),
      },
      event_id: this.toInt(this.reader.ReadBytes(2)),
      properties_count: this.toInt(this.reader.ReadBytes(2)),
      ioElements: [],
    };

    if ('0' == avlRecord.gps.longitude.toString(2).substr(0, 1)) {
      avlRecord.gps.longitude *= -1;
    }
    avlRecord.gps.longitude /= this._gpsPrecision;

    if ('0' == avlRecord.gps.latitude.toString(2).substr(0, 1)) {
      avlRecord.gps.latitude *= -1;
    }
    avlRecord.gps.latitude /= this._gpsPrecision;

    avlRecord.ioElements = this.parseIoElements();

    this.avlObj.records.push(avlRecord);
  }

  /**
   * Parse single IoElement records
   *
   * @returns {Array}
   */
  parseIoElements() {
    let ioElement = [];

    /**
     * Read 1 byte ioProperties
     */
    let ioCountInt8 = this.toInt(this.reader.ReadBytes(2));

    for (var i = 0; i < ioCountInt8; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(2));
      let value = this.toInt(this.reader.ReadBytes(1));

      // let elToPush = {
      //     id        : property_id,
      //     value     : value
      // };
      // if(this.ioElements()[property_id]){
      //     elToPush.label = this.ioElements()[property_id].label;
      //     elToPush.dimension = this.ioElements()[property_id].dimension;
      //     if(this.ioElements()[property_id].values[value]){
      //         elToPush.valueHuman: this.ioElements()[property_id].values[value];
      //     }
      // }

      ioElement.push({
        id: property_id,
        value: value,
        label: this.ioElements()[property_id]
          ? this.ioElements()[property_id].label
          : '',
        dimension: this.ioElements()[property_id]
          ? this.ioElements()[property_id].dimension
          : '',
        valueHuman: this.ioElements()[property_id]
          ? this.ioElements()[property_id].values
            ? this.ioElements()[property_id].values[value]
            : ''
          : '',
      });
    }

    /**
     * Read 2 byte ioProperties
     */
    let ioCountInt16 = this.toInt(this.reader.ReadBytes(2));

    for (var i = 0; i < ioCountInt16; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(2));
      let value = this.reader.ReadInt16();

      ioElement.push({
        id: property_id,
        value: value,
        label: this.ioElements()[property_id]
          ? this.ioElements()[property_id].label
          : '',
        dimension: this.ioElements()[property_id]
          ? this.ioElements()[property_id].dimension
          : '',
        valueHuman: this.ioElements()[property_id]
          ? this.ioElements()[property_id].values
            ? this.ioElements()[property_id].values[value]
            : ''
          : '',
      });
    }

    /**
     * Read 4 byte ioProperties
     */
    let ioCountInt32 = this.toInt(this.reader.ReadBytes(2));

    for (var i = 0; i < ioCountInt32; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(2));
      let value = this.reader.ReadInt32();
      ioElement.push({
        id: property_id,
        value: value,
        label: this.ioElements()[property_id]
          ? this.ioElements()[property_id].label
          : '',
        dimension: this.ioElements()[property_id]
          ? this.ioElements()[property_id].dimension
          : '',
        valueHuman: this.ioElements()[property_id]
          ? this.ioElements()[property_id].values
            ? this.ioElements()[property_id].values[value]
            : ''
          : '',
      });
    }

    /**
     * Read 8 byte ioProperties
     */
    let ioCountInt64 = this.toInt(this.reader.ReadBytes(2));

    for (var i = 0; i < ioCountInt64; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(2));
      let value = this.reader.ReadDouble();
      ioElement.push({
        id: property_id,
        value: value,
        label: this.ioElements()[property_id]
          ? this.ioElements()[property_id].label
          : '',
        dimension: this.ioElements()[property_id]
          ? this.ioElements()[property_id].dimension
          : '',
        valueHuman: this.ioElements()[property_id]
          ? this.ioElements()[property_id].values
            ? this.ioElements()[property_id].values[value]
            : ''
          : '',
      });
    }

    /**
     * Read n byte ioProperties
     */

    let ioCountIntX = this.toInt(this.reader.ReadBytes(2));
    for (var i = 0; i < ioCountIntX; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(2));
      let ioValueLength = this.toInt(this.reader.ReadBytes(2));
      if(property_id == 385){
        let dataPart = this.toInt(this.reader.ReadBytes(1));
        let beaconFlags = null;
        let beaconID = null;
        let beaconRssi = null;
        let ary = []
        for(let j=0; j<dataPart; j++){
          beaconFlags = this.toInt(this.reader.ReadBytes(1))
          beaconID = this.reader.ReadBytes(16).toString('hex').toUpperCase()
          beaconRssi = (this.toInt(this.reader.ReadBytes(1))) - 256
          ary.push({
            beacon_flag : beaconFlags,
            beacon_id : beaconID,
            beacon_rssi : beaconRssi
          })
        }
        ioElement.push({
          id: property_id,
          value : ary,
          label: this.ioElements()[property_id]
            ? this.ioElements()[property_id].label
            : '',
          dimension: this.ioElements()[property_id]
            ? this.ioElements()[property_id].dimension
            : '',
          valueHuman: this.ioElements()[property_id]
            ? this.ioElements()[property_id].values
              ? this.ioElements()[property_id].values[value]
              : ''
            : '',
        });
      }else{
        // NaN Value
        if(ioValueLength){
          let value = this.toString(this.reader.ReadBytes(ioValueLength));
          ioElement.push({
            id: property_id,
            value: value,
            label: this.ioElements()[property_id]
              ? this.ioElements()[property_id].label
              : '',
            dimension: this.ioElements()[property_id]
              ? this.ioElements()[property_id].dimension
              : '',
            valueHuman: this.ioElements()[property_id]
              ? this.ioElements()[property_id].values
                ? this.ioElements()[property_id].values[value]
                : ''
              : '',
          });
        }

      }
    }

    return ioElement;
  }

  /**
   *  Codec 8 IoElements
   * @returns {{"1": {label: string, values: {"0": string, "1": string}}, "10": {label: string, values: {"0": string, "1": string}}, "11": {label: string}, "12": {label: string}, "13": {label: string, dimension: string}, "14": {label: string}, "15": {label: string}, "16": {label: string}, "17": {label: string}, "18": {label: string}, "19": {label: string}, "20": {label: string, dimension: string}, "21": {label: string, values: {"1": string, "2": string, "3": string, "4": string, "5": string}}, "22": {label: string, dimension: string}, "23": {label: string, dimension: string}, "24": {label: string, dimension: string}, "25": {label: string, dimension: string}, "26": {label: string, dimension: string}, "27": {label: string, dimension: string}, "28": {label: string, dimension: string}, "29": {label: string, dimension: string}, "30": {label: string}, "31": {label: string, dimension: string}, "32": {label: string, dimension: string}, "33": {label: string, dimension: string}, "34": {label: string, dimension: string}, "35": {label: string, dimension: string}, "36": {label: string, dimension: string}, "37": {label: string, dimension: string}, "38": {label: string, dimension: string}, "39": {label: string, dimension: string}, "40": {label: string, dimension: string}, "41": {label: string, dimension: string}, "42": {label: string, dimension: string}, "43": {label: string, dimension: string}, "44": {label: string, dimension: string}, "45": {label: string, dimension: string}, "46": {label: string, dimension: string}, "47": {label: string, dimension: string}, "48": {label: string, dimension: string}, "49": {label: string, dimension: string}, "50": {label: string, dimension: string}, "51": {label: string, dimension: string}, "52": {label: string, dimension: string}, "53": {label: string, dimension: string}, "54": {label: string, dimension: string}, "55": {label: string, dimension: string}, "56": {label: string, dimension: string}, "57": {label: string, dimension: string}, "58": {label: string, dimension: string}, "59": {label: string, dimension: string}, "60": {label: string, dimension: string}, "66": {label: string, dimension: string}, "67": {label: string, dimension: string}, "68": {label: string, dimension: string}, "69": {label: string, values: {"0": string, "1": string, "2": string, "3": string}}, "80": {label: string, values: {"0": string, "1": string, "2": string, "3": string, "4": string, "5": string}}, "86": {label: string, dimension: string}, "104": {label: string, dimension: string}, "106": {label: string, dimension: string}, "108": {label: string, dimension: string}, "181": {label: string}, "182": {label: string}, "199": {label: string}, "200": {label: string, values: {"0": string, "1": string, "2": string}}, "205": {label: string}, "206": {label: string}, "238": {label: string}, "239": {label: string, values: {"0": string, "1": string}}, "240": {label: string, values: {"0": string, "1": string}}, "241": {label: string}, "256": {label: string}}}
   */
  ioElements() {
    return {
      1: {
        label: 'Din 1',
        dimension: '',
        values: {
          0: '0',
          1: '1',
        },
      },
      10: {
        label: 'SD Status',
        values: {
          0: 'Not present',
          1: 'Present',
        },
      },
      11: {
        label: 'SIM ICCID1 number',
        dimension: '',
      },
      12: {
        label: 'Fuel Used GPS',
        dimension: '',
      },
      13: {
        label: 'Average Fuel Use',
        dimension: 'L / 100 km',
      },
      14: {
        label: 'SIM ICCID2 number',
        dimension: '',
      },
      15: {
        label: 'Eco Score',
        dimension: '',
      },
      16: {
        label: 'Total Odometer',
        dimension: '',
      },
      17: {
        label: 'Accelerometer X axis',
        dimension: 'mG',
      },
      18: {
        label: 'Accelerometer Y axis',
        dimension: 'mG',
      },
      19: {
        label: 'Accelerometer Z axis',
        dimension: 'mG',
      },
      20: {
        label: 'BLE 2 Battery Voltage',
        dimension: '%',
      },
      21: {
        label: 'GSM Signal Strength',
        dimension: '',
        values: {
          1: '1',
          2: '2',
          3: '3',
          4: '4',
          5: '5',
        },
      },
      22: {
        label: 'BLE 3 Battery Voltage',
        dimension: '%',
      },
      23: {
        label: 'BLE 4 Battery Voltage',
        dimension: '%',
      },
      24: {
        label: 'Speed',
        dimension: 'km/h',
      },
      25: {
        label: 'BLE 1 Temperature',
        dimension: 'C',
      },
      26: {
        label: 'BLE 2 Temperature',
        dimension: 'C',
      },
      27: {
        label: 'BLE 3 Temperature',
        dimension: 'C',
      },
      28: {
        label: 'BLE 4 Temperature',
        dimension: 'C',
      },
      29: {
        label: 'BLE 1 Battery Voltage',
        dimension: '%',
      },
      30: {
        label: 'Number of DTC',
        dimension: '',
      },
      31: {
        label: 'Calculated engine load value',
        dimension: '%',
      },
      32: {
        label: 'Engine coolant temperature',
        dimension: 'C',
      },
      33: {
        label: 'Short term fuel trim 1',
        dimension: '%',
      },
      34: {
        label: 'Fuel pressure',
        dimension: 'kPa',
      },
      35: {
        label: 'Intake manifold absolute pressure',
        dimension: 'kPa',
      },
      36: {
        label: 'Engine RPM',
        dimension: 'rpm',
      },
      37: {
        label: 'Vehicle speed',
        dimension: 'km/h',
      },
      38: {
        label: 'Timing advance',
        dimension: '°',
      },
      39: {
        label: 'Intake air temperature',
        dimension: 'C',
      },
      40: {
        label: 'MAF air flow rate',
        dimension: 'g/sec, *0.01',
      },
      41: {
        label: 'Throttle position',
        dimension: '%',
      },
      42: {
        label: 'Run time since engine start',
        dimension: 's',
      },
      43: {
        label: 'Distance traveled MIL on',
        dimension: 'Km',
      },
      44: {
        label: 'Relative fuel rail pressure',
        dimension: 'kPa*0.1',
      },
      45: {
        label: 'Direct fuel rail pressure',
        dimension: 'kPa*0.1',
      },
      46: {
        label: 'Commanded EGR',
        dimension: '%',
      },
      47: {
        label: 'EGR error',
        dimension: '%',
      },
      48: {
        label: 'Fuel level',
        dimension: '%',
      },
      49: {
        label: 'Distance traveled since codes cleared',
        dimension: 'Km',
      },
      50: {
        label: 'Barometric pressure',
        dimension: 'kPa',
      },
      51: {
        label: 'Control module voltage',
        dimension: 'mV',
      },
      52: {
        label: 'Absolute load value',
        dimension: '%',
      },
      53: {
        label: 'Ambient air temperature',
        dimension: 'C',
      },
      54: {
        label: 'Time run with MIL on',
        dimension: 'min',
      },
      55: {
        label: 'Time since trouble codes cleared',
        dimension: 'min',
      },
      56: {
        label: 'Absolute fuel rail pressure',
        dimension: 'kPa*10',
      },
      57: {
        label: 'Hybrid battery pack remaining life',
        dimension: '%',
      },
      58: {
        label: 'Engine oil temperature',
        dimension: 'C',
      },
      59: {
        label: 'Fuel injection timing',
        dimension: 'O, *0.01',
      },
      60: {
        label: 'Engine fuel rate',
        dimension: 'L/h, *100',
      },
      66: {
        label: 'Ext Voltage',
        dimension: 'mV',
      },
      67: {
        label: 'Battery Voltage',
        dimension: 'mV',
      },
      68: {
        label: 'Battery Current',
        dimension: 'mA',
      },
      69: {
        label: 'GNSS Status',
        dimension: '',
        values: {
          0: 'OFF',
          1: 'ON with fix',
          2: 'ON without fix',
          3: 'In sleep state',
        },
      },
      80: {
        label: 'Data Mode',
        dimension: '',
        values: {
          0: 'Home On Stop',
          1: 'Home On Moving',
          2: 'Roaming On Stop',
          3: 'Roaming On Moving',
          4: 'Unknown On Stop',
          5: 'Unknown On Moving',
        },
      },
      81:{
        label: 'Vehicle Speed',
        dimension: 'km/h',
      },
      82:{
        label: 'Accelerator Pedal Position',
        dimension: '%',
      },
      83:{
        label: 'Fuel Consumed',
        dimension: 'l',
      },
      84:{
        label: 'Fuel Level',
        dimension: 'l',
      },
      85:{
        label: 'Engine RPM',
        dimension: 'rpm',
      },
      86: {
        label: 'BLE 1 Humidity',
        dimension: '%RH',
      },
      87:{
        label: 'Total Mileage',
        dimension: 'm',
      },
      89:{
        label: 'Fuel level',
        dimension: '%',
      },
      90:{
        label: 'Door Status',
        dimension: '',
      },
      100:{
        label: 'Program Number',
        dimension: '',
      },
      101:{
        label: 'Module ID 8B',
        dimension: '',
      },
      102:{
        label: 'Engine Worktime',
        dimension: 'min',
      },
      103:{
        label: 'Engine Worktime (counted)',
        dimension: 'min',
      },
      104: {
        label: 'BLE 2 Humidity',
        dimension: '%RH',
      },
      105:{
        label: 'Total Mileage (counted)',
        dimension: 'm',
      },
      106: {
        label: 'BLE 3 Humidity',
        dimension: '%RH',
      },
      107: {
        label: 'Fuel Consumed (counted)',
        dimension: 'l',
      },
      108: {
        label: 'BLE 4 Humidity',
        dimension: '%RH',
      },
      110: {
        label: 'Fuel Rate',
        dimension: 'l/h',
      },
      111: {
        label: 'AdBlue Level',
        dimension: '%',
      },
      112: {
        label: 'AdBlue Level',
        dimension: 'l',
      },
      113: {
        label: 'FM battery level',
        dimension: '%',
      },
      114: {
        label: 'Engine Load',
        dimension: '%',
      },
      115:{
        label: 'Engine Temperature',
        dimension: '°C',
      },
      123:{
        label: 'Control State Flags',
        dimension: '',
      },
      124:{
        label: 'Agricultural Machinery Flags',
        dimension: '',
      },
      132:{
        label: 'Security State Flags',
        dimension: '',
      },
      133:{
        label: 'Tachograph Total Vehicle Distance',
        dimension: 'm',
      },
      134:{
        label: 'Trip Distance',
        dimension: 'm',
      },
      135:{
        label: 'Tachograph Vehicle Speed',
        dimension: 'km/h',
      },
      136:{
        label: 'Tacho Driver Card Presence',
        dimension: '',
      },
      137:{
        label: 'Driver 1 States',
        dimension: '',
      },
      138:{
        label: 'Driver 2 States',
        dimension: '',
      },
      168:{
        label: 'Battery Voltage',
        dimension: 'V',
      },
      181: {
        label: 'PDOP',
        dimension: '',
      },
      182: {
        label: 'HDOP',
        dimension: '',
      },
      199: {
        label: 'Trip Odometer',
        dimension: 'm',
      },
      200: {
        label: 'Sleep Mode',
        dimension: '',
        values: {
          0: 'No Sleep',
          1: 'GPS Sleep',
          2: 'Deep Sleep',
        },
      },
      205: {
        label: 'GSM Cell ID',
        dimension: '',
      },
      206: {
        label: 'GSM Area Code',
        dimension: '',
      },
      232:{
        label: 'CNG Status',
        dimension: '',
      },
      237:{
        label: 'Network Type',
        dimension: '',
        values: {
          0: '3G',
          1: 'GSM',
          2: '4G',
          3: 'LTE CAT M1',
          4: 'LTE CAT NB1',
          99: 'Unknown',
        }
      },
      238: {
        label: 'User ID',
        dimension: '',
      },
      239: {
        label: 'Ignition',
        dimension: '',
        values: {
          0: 'No',
          1: 'Yes',
        },
      },
      240: {
        label: 'Movement',
        dimension: '',
        values: {
          0: 'No',
          1: 'Yes',
        },
      },
      241: {
        label: 'GSM Operator',
        dimension: '',
      },
      243: {
        label: 'Green Driving Event Duration',
        dimension: 'ms',
      },
      246: {
        label: 'Towing Detection Event',
        dimension: '',
        values: {
          1: 'Send Towing detected',
        },
      },
      247: {
        label: 'Crash Detection',
        dimension: '',
        values: {
          1: 'Real Crash Detected (device is calibrated)',
          2: 'Limited Crash Trace (device not calibrated)',
          3: 'Limited Crash Trace (device is calibrated)',
          4: 'Full Crash Trace (device not calibrated)',
          5: 'Full Crash Trace (device is calibrated)',
          6: 'Real Crash Detected (device not calibrated)',
        },
      },
      248: {
        label: 'Immobilizer',
        dimension: '',
        values: {
          0: 'iButton not connected',
          1: 'iButton connected (Immobilizer)',
          2: 'iButton connected (Authorized Driving)',
        },
      },
      249: {
        label: 'Jamming Detection',
        dimension: '',
        values: {
          0: 'Jamming Ended',
          1: 'Jamming Detected',
        },
      },
      250: {
        label: 'Trip Event',
        dimension: '',
        values: {
          0: 'Trip Ended',
          1: 'Trip Started',
          2: 'Business Status',
          3: 'Private Status',
          4: 'Custom Statuses',
          5: 'Custom Statuses',
          6: 'Custom Statuses',
          7: 'Custom Statuses',
          8: 'Custom Statuses',
          9: 'Custom Statuses',
        },
      },
      251: {
        label: 'Idling Event',
        dimension: '',
        values: {
          0: 'Moving',
          1: 'Idling',
        },
      },
      252: {
        label: 'Unplug Event',
        dimension: '',
        values: {
          0: 'Battery Present',
          1: 'Battery Unplugged',
        },
      },
      253: {
        label: 'Green Driving Type',
        dimension: '',
        values: {
          1: 'Acceleration',
          2: 'Braking',
          3: 'Cornering',
        },
      },
      254: {
        label: 'Green Driving Value',
        dimension: 'g*10',
      },
      255: {
        label: 'Overspeeding Event',
        dimension: 'km/h',
      },
      256: {
        label: 'VIN',
        dimension: '',
      },
      281: {
        label: 'fault codes',
        dimension: '',
      },
      385:{
        label : 'Beacon',
        dimension: 'dbm',
      },
      388:{
        label : 'Module ID 17B',
        dimension: '',
      },
      517:{
        label: 'Security State Flags P4',
        dimension: '',
      },
      518:{
        label: 'Control State Flags P4',
        dimension: '',
      }
      /* 113:{
                 label:"Battery Level"
             },
             116:{
                 label:"Charger Connected"
             },
             82:{
                 label:"Accelerator Pedal Position"
             },
             87:{
                 label:"Total Mileage"
             }*/
    };
  }
}

module.exports = Codec8e;
