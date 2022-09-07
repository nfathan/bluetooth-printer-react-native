import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  FlatList,
  NativeEventEmitter,
  PermissionsAndroid,
  Platform,
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
import { PERMISSIONS, check } from 'react-native-permissions' 

const App = () => {
  const [pairedDevices, setPairedDevices] = useState([]);
  const [foundDs, setFoundDs] = useState([]);
  const [bleOpend, setBleOpend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [boundAddress, setBoundAddress] = useState('');
  // path downloads folder
  const [downloadsFolder, setDownloadsFolder] = useState('')
  // file in downloads folder
  // const [files, setFiles] = useState([])

  // const getFileContent = async (path) => {
  //   const reader = await RNFS.readDir(path);
  //   setFiles(reader);
  // }

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

    // get user's file download path 
    setDownloadsFolder(RNFS.DownloadDirectoryPath)

    // acces file in downloads folder 
    // getFileContent(downloadsFolder)

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

        const bluetoothPerm12 = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT )
        const bluetoothPerm11 = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION )
        // const storage = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE )
        // console.log('masuk bawah'+ storage)
        // const fileManagementPerm =  await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE )
        
        // console.log('izin akses file :' + fileManagementPerrm)

        // permissions for android 12 higher
        if(bluetoothPerm12 && bluetoothPerm11) {
          console.log('masuk atas')
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
          console.log('masuk bawah')
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
    } catch (err) {
      console.warn(err);
    }

    // try {
    //   async function fileManagement() {
    //     const permissions = {
    //       title: 'HSD file management meminta izin untuk mengakses file',
    //       message: 'HSD file management memerlukan akses ke file untuk proses management file',
    //       buttonNeutral: 'Lain Waktu',
    //       buttonNegative: 'Tidak',
    //       buttonPositive: 'Boleh',
    //     }

    //     const fileManagementPerm =  await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE )
        
    //     console.log('izin akses file :' + fileManagementPerm)
        
    //     if(fileManagementPerm) {
    //       console.log('akses managemen file diizinkan')
    //       const fileManagementGranted = await PermissionsAndroid.request(
    //         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    //         permissions,
    //       )  
    //       // if(fileManagementGranted) {
    //       //   scanDevices()
    //       // } else {
    //       //   // ignore
    //       // }
    //     }
    //   }
    //   fileManagement()
    // } catch (err) {
    //   console.warn(err)
    // }
  }, [scanDevices]);

  // const Item = ({ name, isFile }) => {
  //   return (
  //     <View>
  //       <Text style={styles.name}>Name: {name}</Text>
  //       <Text> {isFile ? "It is a file" : "It's a folder"}</Text>
  //     </View>
  //   )
  // }

  // const renderItem = ({ item, index }) => {
  //   return (
  //     <View>
  //       <Text style={styles.title}>{index}</Text>
  //       {/* The isFile method indicates whether the scanned content is a file or a folder*/}
  //       <Item name={item.name} isFile={item.isFile()} />
  //     </View>
  //   )
  // }

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
        <SamplePrint />
        <Text>Downloads folder : {downloadsFolder} {console.log(downloadsFolder)}</Text>
        {/* <FlatList
          data={files}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
        /> */}
        <View style={{height: 100}} />
      </ScrollView>
  );
};

export default App;
