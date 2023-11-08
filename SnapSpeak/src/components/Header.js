import * as React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import {FontAwesome} from '@expo/vector-icons'



export default function Header({title, onPress, icon , color}){
    return(
        <TouchableOpacity onPress={pickImage} style={{ position: 'absolute', top: 60, right: 40 }} >
        <FontAwesome name='upload' size={30} color='#f1f1f1' />
      </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        height : 40,
        flexDirection : 'column',
        alignItems : 'center',
        justifyContent: 'center',
    },

    text:{
        fontWeight: 'bold',
        fontSize: 16,
        color : '#f1f1f1',
        marginLeft : 10,

    }
})