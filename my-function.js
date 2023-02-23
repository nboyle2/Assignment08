export const handler = async(event) => {
    const body = JSON.parse(event.body);
    const response = {
        body: `Nicholas Boyle says ${body.keyword}!`
    };
    return response;
};  