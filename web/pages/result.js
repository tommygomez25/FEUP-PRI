import NavBar from '../components/navbar.js';
import { useEffect, useState } from 'react';
import { Skeleton, message, List, Avatar } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Rating, Box } from '@mui/material';
import StarIcon from '@mui/icons-material/Star.js';
import { labels, fixRating, matchHighlighter } from '../utils/utils.js';
import { createUrl } from '../utils/urlUtils.js';
import { errorMessage } from '../utils/errorUtils.js';

export default function Result() {
    const [response, setResponse] = useState();
    const [responseHeader, setResponseHeader] = useState();
    const [query, setQuery] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();
    const [search, setSearch] = useState();
    const [selectedContext, setSelectedContext] = useState();
    const history = useRouter();

    const fetchUrl = async (url) => {
        await axios.get(url)
            .then((response) => {
                setResponse(response.data.response);
                setResponseHeader(response.data.responseHeader);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(error);
                errorMessage('solrError', messageApi);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        // Get the query from url
        const urlParams = new URLSearchParams(window.location.search);
        const search = urlParams.get('search');
        const genres = urlParams.get('choosenGenres');
        const selectedContext = urlParams.get('selectedContext');

        setSearch(search);
        setSelectedContext(selectedContext);
        const defType = 'lucene';
        const fl = encodeURIComponent('*, [child]');
        const q = encodeURIComponent('transcript:"' + search + '"' + (genres ? ' genres:' + genres + '' : ''));
        const q_op = 'AND';
        const rows = 100;

        if (!selectedContext || !search) {
            setIsLoading(false);
            return;
        }

        const url = createUrl(selectedContext, defType, fl, q_op, q, rows);
        if (!url) {
            errorMessage('createUrlError', messageApi);
            setIsLoading(false);
            return;
        }

        fetchUrl(url);
    }, []);

    useEffect(() => {
        if (responseHeader) {
            setQuery(responseHeader.params.q);
        }
    }, [responseHeader]);

    const redirectToConversationPage = (id) => {
        history.push('/conversation?id=' + id + '&selectedContext=' + selectedContext + '&search=' + search);
    };

    return (
        <>
            {contextHolder}
            <div>
                <NavBar />
                {!response ? (
                    <p>No query. Go back to the <a href="/" className='link'>homepage</a> to search.</p>
                ) : (
                    <div>
                        <p style={{ margin: '10px 0px 0px 20px' }}>Searching for {query}</p>
                    </div>
                )}
                {isLoading && <Skeleton active />}
                {!isLoading && response && (
                    <div>
                        <p style={{ margin: '0 20px' }}>Found {response.numFound} results</p>
                        <List
                            itemLayout="horizontal"
                            style={{ margin: '0 20px' }}
                            dataSource={response.docs}
                            header={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>Results</div>
                                    <div style={{ margin: '0 70px 0 0' }}>IMDB Ratings</div>
                                </div>
                            }
                            renderItem={(item, index) => (

                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar src={"https://picsum.photos/200"} />}
                                        title={<a>{item.movie}</a>}
                                        description={<span dangerouslySetInnerHTML={{ __html: item.lines[0].character + ': ' + matchHighlighter(item.lines[0].text, search) }}></span>}
                                        onClick={() => redirectToConversationPage(item.id)}
                                        onMouseEnter={() => { document.body.style.cursor = 'pointer'; }}
                                        onMouseLeave={() => { document.body.style.cursor = 'default'; }}
                                    />
                                    <Rating name="read-only" value={fixRating(6)} precision={0.5} readOnly emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />} />
                                    <Box sx={{ ml: 2 }}>{labels[fixRating(6)]}</Box>
                                </List.Item>
                            )}
                        />
                    </div>
                )}
            </div>
        </>
    )
}