import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  NativeEventEmitter,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  ToastAndroid,
  View,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  BackHandler, 
  Alert
} from 'react-native';
import { BluetoothManager } from 'react-native-bluetooth-escpos-printer';
import ItemList from './ItemList';
// import SamplePrint from './SamplePrint';
import { styles } from './styles';

import RNFS from 'react-native-fs';

import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';

import BackgroundJob from 'react-native-background-actions';

import formatHelp from './format.helpers'

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

BackgroundJob.on('expiration', () => {
  console.log('iOS: I am being closed!');
});

const taskRandom = async (taskData) => {
  const targetFilenameDownload = 'kala.json'

  let downloadFilesDir = null
  let downloadFilesData = null
  let downloadFilesPath = RNFS.DownloadDirectoryPath + '/' + targetFilenameDownload

  const getDownloadFilesDir = async (pathDownloadDirectory) => {
    try {
      const reader = await RNFS.readDir(pathDownloadDirectory);
      downloadFilesDir = reader
    }

    catch(e) {
      console.log('cannot read directory', e)
    }
  }

  const readDownloadFilesData = async () => {
    try {
      const response = await RNFS.readFile(downloadFilesPath);
      downloadFilesData = JSON.parse(response)
    }

    catch(e) {
      console.log('not found file', e)
    }
  }

  const checkingDownloadFiles = () => {
    if(downloadFilesDir && downloadFilesDir.length > 0) {
      // removing undesire file
      const targetFiles = downloadFilesDir.filter(
        nameDir => nameDir.name && /\kala(.)*(.json)/g.test(nameDir.name)
      )

      const isExistTargetFile = targetFiles.length
      
      if (!isExistTargetFile) return false
    
      try {
        const latestFileKalaDownload = targetFiles &&
          Array.isArray(targetFiles) &&
            downloadFilesDir.reduce((currLatestFile, currFile) => {
              if (!currFile) return currLatestFile
              const { name } = currFile
              
              const regextTestFile = /^([^\\]*)\(([^\\]*)\)\.(\w+)$/
              const matchRegexCurrFile = name.match(regextTestFile)
              const matchRegexCurrLatestFile = currLatestFile.match(regextTestFile)

              const seqCurrFile = matchRegexCurrFile ? Number(matchRegexCurrFile[2]) : 0
              const seqLatestCurrFile = matchRegexCurrLatestFile ? Number(matchRegexCurrLatestFile[2]) : 0

              if (seqCurrFile > seqLatestCurrFile) return name
              return currLatestFile
            }, targetFilenameDownload)

          if (latestFileKalaDownload) {
            downloadFilesPath = RNFS.DownloadDirectoryPath + '/' + latestFileKalaDownload
          }
        
        return true
      } catch(e) {
        console.log('cannot found target filename: ', e)

        return false
      }
    }
    
    return false
  }

  const printingDownloadFiles = async () => {
    let columnWidths = [21, 11];

    try {
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.CENTER],
        [`${downloadFilesData.company_name || '-'}`],
        {
          heigthtimes: 1.5,
        },
      );
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.CENTER],
        [`${downloadFilesData.company_address || '-'}`],
        {},
      );

      await BluetoothEscposPrinter.printText('\r\n', {});

      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        [`NO: ${downloadFilesData.transaction_number }`],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        [`TANGGAL: ${downloadFilesData.transaction_date}`],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        [`KASIR: ${downloadFilesData.cashier}`],
        {},
      );
      await BluetoothEscposPrinter.printText(
        '--------------------------------',
        {},
      );

      await BluetoothEscposPrinter.printText('\r\n', {});

      await BluetoothEscposPrinter.printColumn(
        [12, 20],
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        [
          `Nama`,
          `Total`
        ],
        {},
      );
      await BluetoothEscposPrinter.printText(
        '--------------------------------',
        {},
      );

      await BluetoothEscposPrinter.printText('\r\n', {});

      for (let productItem of downloadFilesData.products) {
        console.log('nama produkct jhjj :'+productItem)
        await BluetoothEscposPrinter.printColumn(
          [23, 9],
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.LEFT,
          ],
          [
            `${productItem.product_name}`,
            ''
          ],
          {},
        )
        await BluetoothEscposPrinter.printColumn(
          columnWidths,
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.RIGHT,
          ],
          [
            ` ${productItem.product_quantity} ${productItem.product_unit} x ${productItem.product_price}`, 
            `${productItem.product_amount}`,
          ],
          {},
        )
      }

      await BluetoothEscposPrinter.printText(
        '--------------------------------',
        {},
      );
      
      await BluetoothEscposPrinter.printText('\r\n', {});

      await BluetoothEscposPrinter.printColumn(
        [12, 20],
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        [
          `TOTAL`,
          `${downloadFilesData.amount}`
        ],
        {},
      );
      await BluetoothEscposPrinter.printColumn(
        [12, 20],
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        [
          `DIBAYAR`,
          `${downloadFilesData.paid}`
        ],
        {},
      );

      await BluetoothEscposPrinter.printColumn(
        [12, 20],
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        [
          `KEMBALIAN`,
          ` ${downloadFilesData.change_money}`
        ],
        {},
      );

      await BluetoothEscposPrinter.printText('\r\n', {});
      
      await BluetoothEscposPrinter.printText(
        downloadFilesData.status === 'paid' ? '---------- Lunas ----------' : '---------- Tagihan ----------',
        {},
      );
      
      await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
    } catch (e) {
      alert(e.message || 'ERROR');
    }
  }
  
  const deleteDownloadFiles = async (path) => {
    try {
      const allTargetFiles = Array.isArray(downloadFilesDir) &&
                      downloadFilesDir.filter(
                        nameDir => nameDir.name && /\kala(.)*(.json)/g.test(nameDir.name)
                      )
      
      if (allTargetFiles.length) {
        for (let targetFile of allTargetFiles) {
          const { name } = targetFile
          
          await RNFS.unlink(RNFS.DownloadDirectoryPath + '/' + name)
        }
      }

    } catch (e) {
      console.log('cannot delete files or not found files: ', e);
    }
  }

  if (Platform.OS === 'ios') {
    console.warn(
      'This task will not keep your app alive in the background by itself, use other library like react-native-track-player that use audio,',
      'geolocalization, etc. to keep your app alive in the background while you excute the JS from this library.'
    );
  }
  
  await new Promise(async (resolve) => {
    // For loop with a delay
    const { delay } = taskData;
    console.log('BG ACTIONS ' + BackgroundJob.isRunning(), delay)
    for (let number = 0; BackgroundJob.isRunning(); number++) {
      console.log('Runned -> ', number);
      await BackgroundJob.updateNotification({ taskDesc: 'Printer sedang terkoneksi dan berjalan..'});
      await sleep(delay);

      await getDownloadFilesDir(RNFS.DownloadDirectoryPath)

      if(checkingDownloadFiles()) {
        await readDownloadFilesData(downloadFilesPath)
        console.log('printer siap untuk ngeprint')
        await printingDownloadFiles()

        await deleteDownloadFiles(downloadFilesPath)
        await getDownloadFilesDir(RNFS.DownloadDirectoryPath)
      } else {
        downloadFilesData = null
        console.log('belum siap ngeprint')
      }

      console.log('directorinya :' + downloadFilesDir)
      console.log('isi datanya:' + downloadFilesData)
    }
  });
};

const options = {
  taskName: 'Example',
  taskTitle: 'KalaPrinter Running',
  taskDesc: 'ExampleTask desc',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'exampleScheme://chat/jane',
  parameters: {
    delay: 1000,
  },
};

function handleOpenURL(evt) {
  console.log(evt.url);
  // do something with the url
}

Linking.addEventListener('url', handleOpenURL);



const App = () => {
  const usingHermes = typeof HermesInternal === 'object' && HermesInternal !== null;
  let playing = BackgroundJob.isRunning();

  const [pairedDevices, setPairedDevices] = useState([]);
  const [foundDs, setFoundDs] = useState([]);
  const [bleOpend, setBleOpend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [boundAddress, setBoundAddress] = useState('');
  const [backgroundRunning, setBackgroundRunning] = useState(BackgroundJob.isRunning())
  
  // boolean for priter is paired or not 
  let isPrinterBound = false
  if(boundAddress.length > 0) {
    isPrinterBound = true
  } else {
    isPrinterBound = false
  }

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
        
        const readStorage = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE )
        const readStorageGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          permissions,
        )

        const writeStorage = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE )
        const writeStorageGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          permissions,
        )

        console.log('permissions read storage :' + readStorage + ` and read storage granted : ${readStorageGranted}`)
        console.log('permissions write storage :' + writeStorage + ` and read storage granted : ${writeStorageGranted}`)

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
  
          if(bluetoothScanGranted === PermissionsAndroid.RESULTS.GRANTED) {
            scanDevices()
          } else {
            // ignore
          }
        }

      }
      blueTooth();
    } catch (err) {
      console.warn(err);
    }
  }, [scanDevices]);
  
  useEffect(() => {
    const backAction = () => {
      if(isPrinterBound) {
        Alert.alert(
          "Printer sedang terhubung. Jika menutup Aplikasi, Anda tidak bisa melakukan print.",  
          "Apakah Anda Yakin ingin menutup Aplikasi?", 
        [
          {
            text: "Tidak",
            onPress: () => null,
            style: "cancel"
          },
          { text: "Ya", onPress: () => BackHandler.exitApp() }
        ]);
        return true;
      } else {
        BackHandler.exitApp()
        return false
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

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
    
    return () => backHandler.remove();

  }, [boundAddress, deviceAlreadPaired, deviceFoundEvent, pairedDevices, scan, backgroundRunning, ]);

  

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
        Alert.alert(
          "Gagal menghubungkan",
          "Mohon ulangi lagi.", 
        [
          {
            text: "OK",
            onPress: () => null,
            style: "cancel"
          },
        ]);
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
  
  const handleChangeBackgroundRunning = () => {
    setBackgroundRunning(BackgroundJob.isRunning())
  }

  /**
   * Toggles the background task
   */
  const toggleBackground = async () => {
    playing = !playing;
    if (playing) {
      if(!isPrinterBound) {
        Alert.alert(
          "Belum ada Printer yang terhubung",  
          "Mohon pilih Printer dan tekan tombol" + ` "Hubungkan" ` + "agar Printer terhubung ke Aplikasi.", 
        [
          {
            text: "OK",
            onPress: () => null,
            style: "cancel"
          },
        ]);
      } else {
        try {        
          console.log('Trying to start background service');
          await BackgroundJob.start(taskRandom, options);
          console.log('Successful start!');
          handleChangeBackgroundRunning()
        } catch (e) {
          console.log('Error', e);
        }
      }
    } else {
      console.log('Stop background service');
      await BackgroundJob.stop();
      handleChangeBackgroundRunning()
      // BackHandler.exitApp()
    }
  };


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.bluetoothStatusContainer}>
          <Text style={styles.bluetoothStatus(bleOpend ? '#00BCD4' : '#A8A9AA')}>
            Bluetooth Sedang {bleOpend ? 'Aktif' : 'Non Aktif'}
          </Text>
        </View>
        {!bleOpend && <Text style={styles.bluetoothInfo}>MOHON AKTIFKAN BLUETOOTH ANDA SEBELUM AKTIFKAN APLIKASI</Text>}
        <Text style={styles.sectionTitle}>Printer yang terhubung ke Aplikasi:</Text>
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
          <Text style={styles.printerInfo}>Belum ada Printer yang terhubung</Text>
        )}
        <Text style={styles.sectionTitle}>Bluetooth yang terhubung ke Perangkat:</Text>
        {loading ? <ActivityIndicator animating={true} /> : null}
        <View style={styles.containerList}>
          {pairedDevices.map((item, index) => {
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
        {/* <SamplePrint 
          fileData={fileData} 
          checkingDownloadFiles={checkingDownloadFiles()}
        /> */}
        {!usingHermes ? null : (
          <View style={{
            position: 'absolute',
            right: 0,
          }}>
            <Text>Engine: Hermes</Text>
          </View>
        )}        
        <View style={{height: 80}} />
      </ScrollView>
      <View 
        style={{ 
          flex: 0.1,
          justifyContent: "center",
          paddingHorizontal: 10 
        }}>
        {
          !backgroundRunning ?
            <TouchableOpacity
              style={{
                alignItems: "center",            
                backgroundColor: "#00BCD4",
                padding: 20,
                borderRadius: 15,
              }}
              onPress={toggleBackground}>
                <Text 
                  style={{ 
                    color: 'white',
                    textAlign: 'center',
                    fontSize: 17, 
                    fontWeight: 'bold',
                  }}>
                    TEKAN DISINI UNTUK AKTIFKAN APLIKASI
                </Text>
            </TouchableOpacity>
            :
            <TouchableOpacity
              style={{
                alignItems: "center",            
                backgroundColor: "#E9493F",
                padding: 20,
                borderRadius: 15,
              }}
              onPress={toggleBackground}>
                <Text 
                  style={{ 
                    color: 'white',
                    textAlign: 'center',
                    fontSize: 17, 
                    fontWeight: 'bold',
                  }}>
                    TEKAN DISINI UNTUK HENTIKAN APLIKASI
                </Text>
            </TouchableOpacity>
        }
      </View>
    </SafeAreaView>
  );
};

export default App;
