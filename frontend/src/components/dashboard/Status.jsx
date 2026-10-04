export default function Status({children, warning=false}) {return <span className={`desk-status ${warning?'is-warning':''}`}><i aria-hidden="true"/>{children}</span>;}
