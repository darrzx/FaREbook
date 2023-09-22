import { gql, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";

const ACTIVATE_USER_MUTATION = gql`
  mutation VerifyAccount($id:ID!){
    verifyAccount(id:$id)
  }
`;

export function Activate() {
    const { id } = useParams();
    const [activateUser, { data, loading, error }] = useMutation(ACTIVATE_USER_MUTATION);

    const handleSubmit = async(e: React.FormEvent) => {

        try {
            await activateUser({
                variables: {
                    id: id                
                },
            }).then((response) => {
                if(response.data.verifyAccount){
                    window.location.href = '/login'
                }
            })
            console.log({data, loading, error})
            window.location.href = '/login'

        } catch (error) {
            console.log(error)
        }
        e.preventDefault();
    }


    return (
        <>
        <h1>Activate Page</h1>
        <form onSubmit={handleSubmit}>
            <button type="submit" className="activate-button">Activate</button>
        </form>
        </>
    )
}