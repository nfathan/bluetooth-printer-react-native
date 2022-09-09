import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';
import { hsdLogo } from './dummy-logo';

const SamplePrint = (props) => {
  // console.log('ini fileData props :' + JSON.stringify(props.fileData))
  // console.log(typeof(props.fileData.supplier_name))

  return (
    <View>
      <Text>Sample Print Instruction</Text>
      <View style={styles.btn}>
        <Button
          onPress={async () => {
            await BluetoothEscposPrinter.printBarCode(
              '123456789012',
              BluetoothEscposPrinter.BARCODETYPE.JAN13,
              3,
              120,
              0,
              2,
            );
            await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
          }}
          title="Print BarCode"
        />
      </View>
      <View style={styles.btn}>
        <Button
          onPress={async () => {
            await BluetoothEscposPrinter.printQRCode(
              'https://hsd.co.id',
              280,
              BluetoothEscposPrinter.ERROR_CORRECTION.L,
            ); //.then(()=>{alert('done')},(err)=>{alert(err)});
            await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
          }}
          title="Print QRCode"
        />
      </View>

      <View style={styles.btn}>
        <Button
          onPress={async () => {
            await BluetoothEscposPrinter.printerUnderLine(2);
            await BluetoothEscposPrinter.printText('Prawito Hudoro\r\n', {
              encoding: 'GBK',
              codepage: 0,
              widthtimes: 0,
              heigthtimes: 0,
              fonttype: 1,
            });
            await BluetoothEscposPrinter.printerUnderLine(0);
            await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
          }}
          title="Print UnderLine"
        />
      </View>

      <View style={styles.btn}>
        <Button
          title="Print Struk Belanja"
          // title={`${props.fileData.supplier_name}`}
          // onPress={async () => {
          //   let columnWidths = [8, 20, 20];
          //   try {
          //     await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
          //     await BluetoothEscposPrinter.printPic(hsdLogo, { width: 250, left: 150 });
          //     await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
          //     await BluetoothEscposPrinter.printColumn(
          //       [48],
          //       [BluetoothEscposPrinter.ALIGN.CENTER],
          //       ['Jl. Brigjen Saptadji Hadiprawira No.93'],
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printColumn(
          //       [32],
          //       [BluetoothEscposPrinter.ALIGN.CENTER],
          //       ['https://xfood.id'],
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printText(
          //       '================================================',
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printColumn(
          //       [24, 24],
          //       [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          //       ['Customer', `${props.fileData.supplier_name}`],
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printColumn(
          //       [24, 24],
          //       [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          //       ['Packaging', 'Iya'],
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printColumn(
          //       [24, 24],
          //       [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          //       ['Delivery', 'Ambil Sendiri'],
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printText(
          //       '================================================',
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printText('Products\r\n', { widthtimes: 1 });
          //     await BluetoothEscposPrinter.printText(
          //       '================================================',
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printColumn(
          //       columnWidths,
          //       [
          //         BluetoothEscposPrinter.ALIGN.LEFT,
          //         BluetoothEscposPrinter.ALIGN.LEFT,
          //         BluetoothEscposPrinter.ALIGN.RIGHT,
          //       ],
          //       ['1x', 'Cumi-Cumi', 'Rp.200.000'],
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printColumn(
          //       columnWidths,
          //       [
          //         BluetoothEscposPrinter.ALIGN.LEFT,
          //         BluetoothEscposPrinter.ALIGN.LEFT,
          //         BluetoothEscposPrinter.ALIGN.RIGHT,
          //       ],
          //       ['1x', 'Tongkol Kering', 'Rp.300.000'],
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printColumn(
          //       columnWidths,
          //       [
          //         BluetoothEscposPrinter.ALIGN.LEFT,
          //         BluetoothEscposPrinter.ALIGN.LEFT,
          //         BluetoothEscposPrinter.ALIGN.RIGHT,
          //       ],
          //       ['1x', 'Ikan Tuna', 'Rp.400.000'],
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printText(
          //       '================================================',
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printColumn(
          //       [24, 24],
          //       [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          //       ['Subtotal', 'Rp.900.000'],
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printColumn(
          //       [24, 24],
          //       [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          //       ['Packaging', 'Rp.6.000'],
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printColumn(
          //       [24, 24],
          //       [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          //       ['Delivery', 'Rp.0'],
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printText(
          //       '================================================',
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printColumn(
          //       [24, 24],
          //       [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          //       ['Total', 'Rp.906.000'],
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printText('\r\n\r\n', {});
          //     await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
          //     await BluetoothEscposPrinter.printQRCode(
          //       'DP0837849839',
          //       280,
          //       BluetoothEscposPrinter.ERROR_CORRECTION.L,
          //     );
          //     await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
          //     await BluetoothEscposPrinter.printColumn(
          //       [48],
          //       [BluetoothEscposPrinter.ALIGN.CENTER],
          //       ['DP0837849839'],
          //       { widthtimes: 2 },
          //     );
          //     await BluetoothEscposPrinter.printText(
          //       '================================================',
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printColumn(
          //       [48],
          //       [BluetoothEscposPrinter.ALIGN.CENTER],
          //       ['Sabtu, 18 Juni 2022 - 06:00 WIB'],
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printText(
          //       '================================================',
          //       {},
          //     );
          //     await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
          //     await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
          //   } catch (e) {
          //     alert(e.message || 'ERROR');
          //   }
          // }}
          onPress={async () => {
            let columnWidths = [4, 6, 20];
            try {
              await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
              await BluetoothEscposPrinter.printPic(hsdLogo, { width: 250, left: 150 });
              await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
              await BluetoothEscposPrinter.printColumn(
                [48],
                [BluetoothEscposPrinter.ALIGN.CENTER],
                [`${props.fileData.company_address}` || 'alamat company masih ghoib'],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [32],
                [BluetoothEscposPrinter.ALIGN.LEFT],
                [`No. Transaksi: ${props.fileData.purchase_invoice_no}`],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [32],
                [BluetoothEscposPrinter.ALIGN.LEFT],
                [`Tanggal: ${props.fileData.transaction_date}`],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [32],
                [BluetoothEscposPrinter.ALIGN.LEFT],
                [`Kasir: ${props.fileData.cashier}`],
                {},
              );
              await BluetoothEscposPrinter.printText(
                '==============================',
                {},
              );

              await BluetoothEscposPrinter.printText('\r\n\r\n', {});

              props.fileData.product.map( async (productItem) => {
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

              await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});

              await BluetoothEscposPrinter.printColumn(
                [32],
                [BluetoothEscposPrinter.ALIGN.LEFT],
                [`Total: ${props.fileData.amount}`],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [32],
                [BluetoothEscposPrinter.ALIGN.LEFT],
                [`Dibayar: ${props.fileData.paid}`],
                {},
              );
              
              await BluetoothEscposPrinter.printText(
                '==============================',
                {},
              );

              await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});

              await BluetoothEscposPrinter.printColumn(
                [32],
                [BluetoothEscposPrinter.ALIGN.LEFT],
                [`Kembalian: ${props.fileData.change_money}`],
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
          }}
        />
      </View>

      {/* {
        props.checkingDownloadsFile ? 
        console.log('siap ngeprint') 
        :
        console.log('belum siap ngeprint')

      } */}
    </View>
  );
};

export default SamplePrint;

const styles = StyleSheet.create({
  btn: {
    marginBottom: 8,
  },
});
