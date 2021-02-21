import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";



import {
    gql,
    split,
    ApolloClient,
    useQuery,
    ApolloLink,
    useSubscription,
    HttpLink,
    InMemoryCache,
    useMutation,
  } from "@apollo/client";
  
  

// 3
const httpLink = new HttpLink({
    uri: "https://sono-morena.herokuapp.com/graphql",
  });
  
  const wsLink = new WebSocketLink({
    uri: "wss://sono-morena.herokuapp.com/graphql",
  });
  
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );
  
  export const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([splitLink]),
  });
  
  export const SleepTimes = gql`
    query getSleep {
      sleeps {
          id
        time
        type
      }
    }
  `;
  
  export const SLEEP_CHANGED = gql`
    subscription Sub {
      sleepChanged {
          id
        time
        type
      }
    }
  `;
  
  // function NumberInv() {
  //   const {
  //     data,
  //     loading,
  //   } = useSubscription(SLEEP_CHANGED);
  //   console.log(data)
  //   if(!loading){
  //   return <h4>New comment: {data.sleepChanged.time} </h4>;}else{
  //     return ""
  //   }
  
  export const createSleep = gql(`
  mutation  createSleep($time:DateTime!, $type:String!){
          createSleep(time:$time,  type:$type){
              id
            type
            time
  }}`);