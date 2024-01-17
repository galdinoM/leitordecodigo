import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Asset } from 'expo-asset';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [database, setDatabase] = useState([]);
  const [modalColor, setModalColor] = useState('white');
  const [databaseContent, setDatabaseContent] = useState(null);

  const loadDatabase = async () => {
    try {
      const asset = Asset.fromModule(require('./assets/database.json'));
      await asset.downloadAsync();
      const response = await fetch(asset.localUri);
      const jsonDatabase = await response.json();
      setDatabase(jsonDatabase);
      console.log('Banco de Dados Carregado:', jsonDatabase);
    } catch (error) {
      console.error('Erro ao carregar o banco de dados JSON', error);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      await loadDatabase(); // Carrega o banco de dados ao montar o componente
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setScannedData(data);

    // Verifica se o código está no banco de dados
    const itemInDatabase = database.find(item => item.id === data);

    if (itemInDatabase) {
      // Código encontrado no banco de dados
      console.log('Código encontrado no banco de dados:', itemInDatabase);
      setModalColor('green');
      setDatabaseContent(itemInDatabase.content);
      // Você pode navegar para uma tela verde ou realizar outras ações aqui
    } else {
      // Código não encontrado no banco de dados
      console.log('Código não encontrado no banco de dados');
      setModalColor('red');
      setDatabaseContent(null);
      // Você pode navegar para uma tela vermelha ou realizar outras ações aqui
    }
  };

  if (hasPermission === null) {
    return <Text>Solicitando permissão para acesso à câmera...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Permissão para acesso à câmera negada</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {scanned && (
        <View style={[styles.dataContainer, { backgroundColor: modalColor }]}>
          <Text style={styles.infoText}>Tipo: {scannedData.type}</Text>
          <Text style={styles.infoText}>Dados: {scannedData.data}</Text>
          {databaseContent && (
            <Text style={styles.databaseContentText}>
              Conteúdo do Banco de Dados: {databaseContent}
            </Text>
          )}
          <Button
            title="Escanear Novamente"
            onPress={() => {
              setScanned(false);
              setDatabaseContent(null);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  dataContainer: {
    padding: 16,
    borderRadius: 10,
    margin: 20,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
  },
  databaseContentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
});
