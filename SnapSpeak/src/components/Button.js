import * as React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import {FontAwesome} from '@expo/vector-icons'



export default function Button({title, onPress, icon , color}){
    return(
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <FontAwesome name={icon} size ={30} color={color ? color : '#f1f1f1'}/>
            <Text style={styles.text}>{title}</Text>
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