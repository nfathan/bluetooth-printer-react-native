import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  // FlatList,
  NativeEventEmitter,
  PermissionsAndroid,
  Platform,
  // SafeAreaView,
  ScrollView,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { BluetoothManager } from 'react-native-bluetooth-escpos-printer';
import ItemList from './ItemList';
import SamplePrint from './SamplePrint';
import { styles } from './styles';

import RNFS from 'react-native-fs';

import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';
import { hsdLogo } from './dummy-logo';

const App = () => {
  const [pairedDevices, setPairedDevices] = useState([]);
  const [foundDs, setFoundDs] = useState([]);
  const [bleOpend, setBleOpend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [boundAddress, setBoundAddress] = useState('');
  // path downloads folder
  // const [downloadsFolder, setDownloadsFolder] = useState('');
  // store read file
  const [fileData, setFileData] = useState({})
  // file list 
  const [files, setFiles] = useState([]);
  
  // file download path
  const filePath = RNFS.DownloadDirectoryPath + '/kala.json'
  
  // getting files and folder content (reading directory)
  const getFileContent = async (path) => {
    const reader = await RNFS.readDir(path);
    setFiles(reader);
  };

  // procure data from a chosen file (Reading files)
  const readFile = async (path) => {
    const response = await RNFS.readFile(path);
    console.log('ini response dari read file:' + response)
    setFileData(JSON.parse(response));
  };

  const checkingDownloadFiles = () => {
    if(files.some(file => file.name === 'kala.json')) {
      console.log('file download terbaca')
      return true
    }
    console.log('file download tidak terbaca')
    return false
  }

  const printingDownloadFiles = async () => {
    let columnWidths = [4, 6, 20];

    try {
      await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
      await BluetoothEscposPrinter.printPic(hsdLogo, { width: 250, left: 150 });
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
      await BluetoothEscposPrinter.printColumn(
        [48],
        [BluetoothEscposPrinter.ALIGN.CENTER],
        [`${fileData.company_address}` || 'alamat company masih ghoib'],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        [`No. Transaksi: ${fileData.purchase_invoice_no}`],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        [`Tanggal: ${fileData.transaction_date}`],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        [`Kasir: ${fileData.cashier}`],
        {},
      );
      await BluetoothEscposPrinter.printText(
        '==============================',
        {},
      );

      await BluetoothEscposPrinter.printText('\r\n', {});

      fileData.product.map( async (productItem) => {
        // await BluetoothEscposPrinter.printColumn(
        //   [32],
        //   [BluetoothEscposPrinter.ALIGN.LEFT],
        //   [`${productItem.product_name}`],
        //   {},
        // );

        await BluetoothEscposPrinter.printColumn(
          columnWidths,
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.RIGHT,
          ],
          [
            `${productItem.quantity} x`, 
            ` ${productItem.unit}`, 
            `${productItem.price}`,
          ],
          {},
        )
      })

      await BluetoothEscposPrinter.printText('\r\n', {});

      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        [`Total: ${fileData.amount}`],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        [`Dibayar: ${fileData.paid}`],
        {},
      );
      
      await BluetoothEscposPrinter.printText(
        '==============================',
        {},
      );

      await BluetoothEscposPrinter.printText('\r\n', {});

      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        [`Kembalian: ${fileData.change_money}`],
        {},
      );

      await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
      
      await BluetoothEscposPrinter.printText(
        '========== Lunas ==========',
        {},
      );
      
      await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
      await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
    } catch (e) {
      alert(e.message || 'ERROR');
    }
  }
  
  const deleteDownloadFiles = async (path) => {
    try {
      //delete the item present at 'path'
      await RNFS.unlink(path); 
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    BluetoothManager.isBluetoothEnabled().then(
      enabled => {
        setBleOpend(Boolean(enabled));
        setLoading(false);
      },
      err => {
        err;
      },
    );

    if (Platform.OS === 'ios') {
      let bluetoothManagerEmitter = new NativeEventEmitter(BluetoothManager);
      bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED, rsp => {
        deviceAlreadPaired(rsp);
      });
      bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_DEVICE_FOUND, rsp => {
        deviceFoundEvent(rsp);
      });
      bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_CONNECTION_LOST, () => {
        setName('');
        setBoundAddress('');
      });
    } else if (Platform.OS === 'android') {
      DeviceEventEmitter.addListener(BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED, rsp => {
        deviceAlreadPaired(rsp);
      });
      DeviceEventEmitter.addListener(BluetoothManager.EVENT_DEVICE_FOUND, rsp => {
        deviceFoundEvent(rsp);
      });
      DeviceEventEmitter.addListener(BluetoothManager.EVENT_CONNECTION_LOST, () => {
        setName('');
        setBoundAddress('');
      });
      DeviceEventEmitter.addListener(BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT, () => {
        ToastAndroid.show('Device Not Support Bluetooth !', ToastAndroid.LONG);
      });
    }
    if (pairedDevices.length < 1) {
      scan();
    }

    // if(pairedDevices.length > 0) {
    //   if(pairedDevices.some(item => item.name === 'RPP02N')) {
    //     connect(item)
    //   }
    // }
    console.log('paired devices :' + pairedDevices)

    // Getting file download path (getting file paths)
    // setDownloadsFolder(RNFS.DownloadDirectoryPath);

    // getting files and folder content (reading directory)
    getFileContent(RNFS.DownloadDirectoryPath)
    
    // procure data from a chosen file (Reading files)
    if(checkingDownloadFiles() ) {
      readFile(filePath);
    } else {
      return
    }
    
    // printing if present download files and then deleted it
    if(boundAddress.length > 0) {
      checkingDownloadFiles()
      
      if(checkingDownloadFiles()) {
        console.log('siap ngeprint')
        printingDownloadFiles()

        deleteDownloadFiles(filePath)
        getFileContent(RNFS.DownloadDirectoryPath)
      } else {
        console.log('belum siap ngeprint')
        return
      }
    }

  }, [boundAddress, deviceAlreadPaired, deviceFoundEvent, pairedDevices, scan]);

  const deviceAlreadPaired = useCallback(
    rsp => {
      var ds = null;
      if (typeof rsp.devices === 'object') {
        ds = rsp.devices;
      } else {
        try {
          ds = JSON.parse(rsp.devices);
        } catch (e) {}
      }
      if (ds && ds.length) {
        let pared = pairedDevices;
        if (pared.length < 1) {
          pared = pared.concat(ds || []);
        }
        setPairedDevices(pared);
      }
    },
    [pairedDevices],
  );

  const deviceFoundEvent = useCallback(
    rsp => {
      var r = null;
      try {
        if (typeof rsp.device === 'object') {
          r = rsp.device;
        } else {
          r = JSON.parse(rsp.device);
        }
      } catch (e) {
        // ignore error
      }

      if (r) {
        let found = foundDs || [];
        if (found.findIndex) {
          let duplicated = found.findIndex(function (x) {
            return x.address == r.address;
          });
          if (duplicated == -1) {
            found.push(r);
            setFoundDs(found);
          }
        }
      }
    },
    [foundDs],
  );

  const connect = row => {
    setLoading(true);
    BluetoothManager.connect(row.address).then(
      s => {
        setLoading(false);
        setBoundAddress(row.address);
        setName(row.name || 'UNKNOWN');
      },
      e => {
        setLoading(false);
        alert(e);
      },
    );
  };

  const unPair = address => {
    setLoading(true);
    BluetoothManager.unpaire(address).then(
      s => {
        setLoading(false);
        setBoundAddress('');
        setName('');
      },
      e => {
        setLoading(false);
        alert(e);
      },
    );
  };

  const scanDevices = useCallback(() => {
    setLoading(true);
    BluetoothManager.scanDevices().then(
      s => {
        // const pairedDevices = s.paired;
        var found = s.found;
        try {
          found = JSON.parse(found); //@FIX_it: the parse action too weired..
        } catch (e) {
          //ignore
        }
        var fds = foundDs;
        if (found && found.length) {
          fds = found;
        }
        setFoundDs(fds);
        setLoading(false);
      },
      er => {
        setLoading(false);
        // ignore
      },
    );
  }, [foundDs]);

  const scan = useCallback(() => {
    try {
      async function blueTooth() {
        const permissions = {
          title: 'HSD bluetooth meminta izin untuk mengakses bluetooth',
          message: 'HSD bluetooth memerlukan akses ke bluetooth untuk proses koneksi ke bluetooth printer',
          buttonNeutral: 'Lain Waktu',
          buttonNegative: 'Tidak',
          buttonPositive: 'Boleh',
        };
        
        // const readStorage = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE )
        // const readStorageGranted = await PermissionsAndroid.request(
        //   PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        //   permissions,
        // )

        // const writeStorage = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE )
        // const writeStorageGranted = await PermissionsAndroid.request(
        //   PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        //   permissions,
        // )

        // console.log('read storage ' + readStorage + ` ${readStorageGranted}`)
        // console.log('write storage ' + writeStorage + ` ${writeStorageGranted}`)

        const permission12 = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT )
        const permission11 = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION )
        
        // permissions for android 12 higher
        if(permission12 && permission11) {
          console.log('masuk android 12')
          const bluetoothConnectGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            permissions,
          );
          if (bluetoothConnectGranted === PermissionsAndroid.RESULTS.GRANTED) {
            const bluetoothScanGranted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
              permissions,
            );
            if (bluetoothScanGranted === PermissionsAndroid.RESULTS.GRANTED) {
              scanDevices();
            }
          } else {
            // ignore akses ditolak
          }
        } else { 
          // permissions for android 11 lower
          console.log('masuk android 11 kebawah')
          const bluetoothScanGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            permissions,
          )
  
          if(bluetoothScanGranted) {
            scanDevices()
          } else {
            // ignore
          }
        }

      }
      blueTooth();

      async function storage() {
        const permissions = {
          title: 'HSD bluetooth meminta izin untuk mengakses storage/penyimpanan',
          message: 'HSD bluetooth memerlukan akses ke storage/penyimpanan untuk proses printer',
          buttonNeutral: 'Lain Waktu',
          buttonNegative: 'Tidak',
          buttonPositive: 'Boleh',
        };
        
        const readStorage = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE )
        const writeStorage = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE )

        console.log('permissions read storage ' + readStorage)
        console.log('permissions write storage ' + writeStorage)

        if(readStorage || writeStorage) {
          const readStorageGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            permissions,
          )

          const writeStorageGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            permissions,
          )

          console.log('read storage granted? ' + readStorageGranted)
          console.log('write storage granted? ' + writeStorageGranted)
          
          if(
            readStorageGranted === PermissionsAndroid.RESULTS.GRANTED ||
            writeStorageGranted === PermissionsAndroid.RESULTS.GRANTED
          ) {
            return true
          } else {
            return false
          }
        }

        // if(writeStorage) {
        //   const writeStorageGranted = await PermissionsAndroid.request(
        //     PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        //     permissions,
        //   )
          
        //   console.log('write storage granted? ' + writeStorageGranted)

        //   if(writeStorageGranted === PermissionsAndroid.RESULTS.GRANTED) {
        //     return true
        //   } else {
        //     return false
        //   }
        // }
      }
      storage()

    } catch (err) {
      console.warn(err);
    }
  }, [scanDevices]);
  

  console.log( 'ini isi file kala json :' + fileData)
  // console.log('ini isi folder download :' + files.some(file => file.name === 'kala.json'))


  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.bluetoothStatusContainer}>
        <Text style={styles.bluetoothStatus(bleOpend ? '#47BF34' : '#A8A9AA')}>
          Bluetooth {bleOpend ? 'Aktif' : 'Non Aktif'}
        </Text>
      </View>
      {!bleOpend && <Text style={styles.bluetoothInfo}>Mohon aktifkan bluetooth anda</Text>}
      <Text style={styles.sectionTitle}>Printer yang terhubung ke aplikasi:</Text>
      {boundAddress.length > 0 && (
        <ItemList
          label={name}
          value={boundAddress}
          onPress={() => unPair(boundAddress)}
          actionText="Putus"
          color="#E9493F"
        />
      )}
      {boundAddress.length < 1 && (
        <Text style={styles.printerInfo}>Belum ada printer yang terhubung</Text>
      )}
      <Text style={styles.sectionTitle}>Bluetooth yang terhubung ke HP ini:</Text>
      {loading ? <ActivityIndicator animating={true} /> : null}
      <View style={styles.containerList}>
        {pairedDevices.map((item, index) => {
          // console.log('ini item dari paired devices ' + item.name)
          return (
            <ItemList
              key={index}
              onPress={() => connect(item)}
              label={item.name}
              value={item.address}
              connected={item.address === boundAddress}
              actionText="Hubungkan"
              color="#00BCD4"
            />
          );
        })}
      </View>
      <SamplePrint 
        fileData={fileData} 
        checkingDownloadFiles={checkingDownloadFiles()}
      />
      {/* <Text>Downloads folder : {downloadsFolder} </Text> */}
      <View style={{height: 100}} />
    </ScrollView>
  );
};

export default App;
