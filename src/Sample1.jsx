import React, { useState, useEffect } from 'react';
import Quagga from 'quagga';
import io from 'socket.io-client';

const SampleOne = () => {
    const [barcode, setBarcode] = useState(null);
    const [scanning, setScanning] = useState(false);

    const API_ENDPOINT = "https://duka-back.onrender.com/"
    const socket = io(API_ENDPOINT);

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
            Quagga.start();
            setScanning(true)
            Quagga.onDetected(handleDetected);
        });

        return () => {
            Quagga.stop();
            Quagga.offDetected(handleDetected);
        };
    }, [scanning]);

    const handleDetected = (result) => {
        const audio = document.getElementById("beep")
        audio.play()
        setBarcode(result.codeResult.code);
        socket.emit('joinRoom', 'sender'); // Join the room as a sender
        socket.emit('barcode', result.codeResult.code);
        Quagga.stop()
        setScanning(false)
    }

    const startScan = () => {
        socket.emit('barcode', "0745760386345");

    }
    //   const startScan = () => {
    //     setBarcode(null); // Clear any previous barcode
    //     setScanning(prev=>!prev);
    //     socket.emit('barcode', "Sample Barcode");
    //     Quagga.start();
    //   }

    return (
        <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'top', minHeight: "100vh" }}>
            <div id="barcodeScanner" style={{ width: "100%", height: "450px" }}></div>
            {barcode && (
                <div style={{ position: 'absolute', top: 20, left: 20, backgroundColor: 'white', padding: 10, borderRadius: 5 }}>
                    Obtained barcode: {barcode}
                </div>
            )}

            <button onClick={startScan} style={{ position: 'absolute', top: '50%', left: '50%', padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Scan</button>

            <audio id='beep' src="ping-82822.mp3"></audio>
        </div>
    );
};

export default SampleOne;
