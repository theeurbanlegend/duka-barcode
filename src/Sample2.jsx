import React, { useState, useEffect } from 'react';
import Quagga from 'quagga';
import io from 'socket.io-client';

//const socket = io('http://localhost:3001'); 

const SampleTwo = () => {
  const [barcode, setBarcode] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector('#barcodeScanner'), // the div element to display the camera feed
        constraints: {
          facingMode: "environment" // request environment camera (back-facing on phones)
        },
      },
      decoder: {
        readers: ["ean_reader", "upc_reader", "code_128_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "i2of5_reader", "2of5_reader", "code_93_reader"],
      },
    }, (err) => {
      if (err) {
        console.error('Error initializing Quagga:', err);
        return;
      }
      Quagga.onDetected(handleDetected);
    });

    return () => {
      Quagga.stop();
      Quagga.offDetected(handleDetected);
    };
  }, []);

  const handleDetected = (result) => {
    if (!scanning) return; // Ignore detections if not actively scanning
    setBarcode(result.codeResult.code);
    //socket.emit('barcode', result.codeResult.code); // Send the barcode to the server
    const audio=document.getElementById("beep")
    audio.play()
    stopScan()
  };

  const startScan = () => {
    setBarcode(null); // Clear any previous barcode
    setScanning(true);
    Quagga.start();
  };

  const stopScan = () => {
    setScanning(false);
    Quagga.stop();
  };

  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: "100vh" }}>
      <div style={{ width: "100%", height: "450px", marginBottom: '20px', position: 'relative' }}>
        <div id="barcodeScanner" style={{ width: "100%", height: "100%" }}></div>
        {!scanning && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '10px', borderRadius: '5px' }}>
            <p>Position the code in front of the camera, then press the Scan button</p>
          </div>
        )}
      </div>
      {!scanning?
      <button onClick={startScan} disabled={scanning} style={{ position: 'absolute', top: '50%', left: '50%', padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Scan</button>:
      <button onClick={stopScan} disabled={!scanning} style={{ position: 'absolute', top: '50%', left: '50%', padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Stop</button>}
      {barcode && (
        <div style={{ marginTop: '20px', backgroundColor: 'white', padding: '10px', borderRadius: '5px' }}>
          Obtained barcode: {barcode}
        </div>
      )}
      <audio id='beep' src="ping-82822.mp3"></audio>
    </div>
  );
};

export default SampleTwo;
