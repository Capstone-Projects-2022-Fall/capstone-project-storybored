import React from 'react'

const Toolbar = ({items}) => {

    const item_height = 100/items.length + '%';
    let j = 0;

    return (
        <div className='Toolbar'>
            {items.map(i => <button key={j++} className='Toolbar-Item' title={i.hoverName} style={{width: '100%', height: item_height}} 
                            onClick = {i.func}> {i.icon} </button>)}  
        </div>
    )
}

export default Toolbar