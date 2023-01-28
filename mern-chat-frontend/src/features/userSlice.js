//manage user state
import {createSlice} from '@reduxjs/toolkit'
import appApi from '../services/appApi'

export const userSlice = createSlice({
    name: 'user',
    initialState: null,
    reducers: { //when actions is called, they are going to change the state
        addNotifications: (state, {payload}) => {
            if(state.newMessages[payload])
                state.newMessages[payload]++;
            else 
                state.newMessages[payload] = 1;
        },
        resetNotifications: (state, {payload}) => {
            delete state.newMessages[payload];
        },
    },

    extraReducers: (builder) => {
        //save user after signup
            //get payload(user) from database, and set the payload as new state
        builder.addMatcher(appApi.endpoints.signupUser.matchFulfilled, (state, {payload}) => payload) 
        //save user after login
        builder.addMatcher(appApi.endpoints.loginUser.matchFulfilled, (state, {payload}) => payload) 
        //logout: destroy user session
        builder.addMatcher(appApi.endpoints.logoutUser.matchFulfilled, (state) => null) 
    },
})

export const {addNotifications, resetNotifications} = userSlice.actions 
export default userSlice.reducer