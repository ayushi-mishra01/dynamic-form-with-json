import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import Header from './Header';
import Footer from './Footer';
import axios from 'axios';
import { local_url } from './Urls';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';

const Entities = () =>{
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        getData();
      }, []);


    const getData = async () => {
        try {
          const response = await axios.get(`${local_url}/getAllEntities`);
          setData(response.data);
          console.log(response.data);
        } catch (error) {
          console.error('Error fetching tables:', error);
        }
    };
    const handleMoreHorizClick = (item) => {
        navigate(`/table/${item}`);
      };
    
      const handleDropDownClick = () => {
        console.log('Dropdown icon clicked');
      };

    return(
        <>
            {/* <Header Heading="Entity List" /> */}
            <div className="entity-list">
                {data.map((item, index) => (
                <div key={index} className="entity-item">
                     <div className="text-container">{item}</div>
                     <div className='crud-icon' onClick={()=>handleMoreHorizClick(item)}><MoreHorizOutlinedIcon /></div>
                    <ArrowDropDownIcon className='dropdown-icon' onClick={handleDropDownClick} />
                </div>
                ))}
            </div>
            {/* <Footer /> */}
        </>

    );

}

export default Entities;