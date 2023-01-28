import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import userEvent from '@testing-library/user-event';

//define a service using a base URL
const appApi = createApi({
    reducerPath: 'appApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5001'
    }),

    endpoints: (builder) => ({
        //create the user
        signupUser: builder.mutation({
            query: (user) => ({
                url: '/users',//http://localhost:5001/users
                method: 'POST',
                body: user,
            }),
        }),

        //login user
        loginUser: builder.mutation({
            query: (user) => ({
                url: '/users/login',//http://localhost:5001/users/login
                method: 'POST',
                body: user,
            }),
        }),

        //logout user
        logoutUser: builder.mutation({
            query: (payload) => ({
                url: '/logout',
                method: 'DELETE',
                body: payload,
            }),
        }),
    }),
})

export const {useSignupUserMutation, useLoginUserMutation, useLogoutUserMutation} = appApi;
export default appApi;