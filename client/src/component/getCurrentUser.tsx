import { useState, useEffect } from 'react';
import { encryptStorage } from '../pages/auth/login';
import { gql, useMutation } from '@apollo/client';

const GET_TOKEN_USER_MUTATION = gql`
  mutation GetUserIDByToken($token:String!){
    getUserIdByToken(token:$token){
      id
      firstname
      surname
      email
      dob
      gender
      profilepic
      isActive
    }
  }
`;

export const getCurrentUser = () => {
    const [token, setToken] = useState<any>("");
    const [data, setData] = useState<any>("");

    useEffect(() => {
        if (encryptStorage.getItem("jwtToken"))
            setToken(encryptStorage.getItem("jwtToken"))
    }, [])

    const [getUserWToken] = useMutation(GET_TOKEN_USER_MUTATION)

    useEffect(() => {
        const fetchData = async () => {
            if (token) {
                try {
                    const response = await getUserWToken({
                        variables: {
                            token: token
                        }
                    });
                    await setData(response.data);
                    return data;
                } catch (err) {
                    console.log(err);
                }
            }
        };

        fetchData();
    }, [token]);

    return data !== null ? data : null;
};