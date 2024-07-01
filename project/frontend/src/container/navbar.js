import 'bulma/css/bulma.min.css';
import ai from '../assets/ai.png';

import React from 'react';

function Navbar() {
  return (
    <>

  <nav className="navbar has-background-grey-light" role="navigation" aria-label="main navigation">
    <div className="navbar-brand">
      <a className="navbar-item" href="http://dsgw.mathematik.uni-marburg.de:32855/">
        <img src={ai} width="auto" height="auto"/>
      </a>

      <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasicExample" className="navbar-menu">
      <div className="navbar-start">
        <a className="navbar-item">
          Region-based image similarity search
        </a>
      </div>
  </div>

</nav>
</>
  )
}

export default Navbar;
