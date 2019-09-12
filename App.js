import React from 'react';
import { StyleSheet, Text, View, FlatList, Dimensions, Platform } from 'react-native';
import moment from 'moment';
import { Container, Content, Form, Input, Label, Item, Button, ListItem, List, Left, Right, Body, Thumbnail } from 'native-base'
import axios from 'axios'
import Expo from 'expo';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from 'react-native-chart-kit'

import Constants from "expo-constants";
import { SQLite } from "expo-sqlite";
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

const db = SQLite.openDatabase("db.db");

// export default function App() {
class Prueba extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      fecha: "",
      prueba: "",
      usuario: "",
      pass: "",
      morty: [],
      chart: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [{
          data: [
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100
          ]
        }]
      },
      config: {
        backgroundColor: '#e26a00',
        backgroundGradientFrom: '#fb8c00',
        backgroundGradientTo: '#ffa726',
        decimalPlaces: 2, // optional, defaults to 2dp
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 16
        }
      },
      dimensiones: Dimensions.get('window').width

    }
  }

  async componentWillMount() {
    var fecha = new Date();
    fecha = fecha.toString()
    fecha = moment(fecha).format('YYYY-MM-DD');

    var prueba = "Hola PERRO"
    var suma = this.suma(5, 3)

    this.setState({
      fecha: fecha,
      prueba: prueba
    })

    let datos = await axios.get('https://rickandmortyapi.com/api/character/')

    let arr = []

    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }

    datos.data.results.map((item) => {
      arr.push({
        nombre: item.name,
        foto: item.image
      })
    })

    this.setState({ morty: arr })

    db.transaction(tx => {
      tx.executeSql(
        `create table if not exists usuario (
          usuario_id integer primary key not null,
          nombre text,
          pass text
        );
        `
      );
    })

    var query = `
      select
        *
      from
        usuario
    `

    console.log(query);

    db.transaction((tx) => {
      tx.executeSql(query, [], (tx, result) => {
        console.log(result,'<----- ');
        result.rows._array.map((item) => {
          arr.push({
            nombre: item.nombre,
            foto: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg'
          })
        })
      }), (err) => {
        console.log(err,'<------');
      }
    })

    console.log(Dimensions.get('window').width,'<---- DIMENSIONES');
  }





  suma(a, b) {
      let res = a + b
      return res
  }

  enviar() {
    var d = {
      usuario: this.state.usuario,
      pass: this.state.pass
    }

    var query = `
      insert into
        usuario (nombre, pass)
      values
        (?, ?)
    `

    console.log(query);

    db.transaction((tx) => {
      tx.executeSql(query, [d.usuario, d.pass], (tx, result) => {
        console.log(result,'<----- ');
        var arr = this.state.morty
        arr.push({
          nombre: d.usuario,
          foto: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg'
        })
        console.log(arr,'<------');
        this.setState({ morty: arr })
      }), (err) => {
        console.log(err,'<------');
      }
    })

  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log(location,'<------ LOCATION');
  };

  render() {

    var datos = (
      this.state.morty.map((item) => {
        return (
          <List>
            <ListItem avatar>
              <Left>
                <Thumbnail source={{ uri: item.foto }} />
              </Left>
              <Body>
                <Text>{item.nombre}</Text>
              </Body>
              <Right>
                <Text note>3:43 pm</Text>
              </Right>
            </ListItem>
          </List>
        )
      })
    )

    return (
      <View style={styles.container}>
        <Container>
          <Content>
            <Form>
              <Item stackedLabel>
                <Label>Username</Label>
                <Input onChangeText={ (value) => this.setState({ usuario: value }) } />
              </Item>
              <Item stackedLabel last>
                <Label>Password</Label>
                <Input onChangeText={ (value) => this.setState({ pass: value }) }/>
              </Item>
            </Form>

            <Button onPress={this.enviar.bind(this)}>
              <Text>Click Me!</Text>
            </Button>

            <LineChart
              data={this.state.chart}
              width={this.state.dimensiones}
              height={220}
              yAxisLabel={'$'}
              chartConfig={this.state.config}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />

            {datos}


          </Content>
        </Container>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20
  },
});

export default Prueba;
