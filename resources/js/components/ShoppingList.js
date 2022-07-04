import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class ShoppingList extends Component
{
    constructor()
    {
        super();
        this.state = 
        {
            isLoading: false,
            msg: '',
            products: [],
            model: {
                id: '',
                text: ''
            },
            searchInput: '',
            filtered: []
        }
    }

    componentDidMount()
    {
        this.setState({isLoading: true});
        fetch('/api/products/')
            .then(response =>
                {
                    if (!response.status >= 400) throw new Error("Errore server: caricamento dati");
                    return response.json();
                })
            .then(products => 
                {
                    this.setState({ isLoading: false });
                    this.setState({ products: products });
                },
                error => { 
                    this.setState({
                        msg: error.message,
                        isLoading: false
                    }) 
                });
    }

    handleModify(product)
    {
        var mod = Object.assign({}, this.state.model);
        mod['id'] = product.id;
        mod['text'] = product.text;
        this.setState({model: mod});
        //document.getElementsByName("id")[0].value = product.id;
        //document.getElementsByName("modText")[0].value = product.text;
    }

    handleDelete(product)
    {
        this.setState({isLoading: true});
        fetch( `/api/products/${product.id}`, 
        {
            method: 'delete',
            headers: 
            {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(response =>
        {
            if (!response.status >= 400) throw new Error("Errore server: caricamento dati");
            return response.json();
        })
        .then(data => 
        {
            this.setState({isLoading: false});
            var copy = this.state.products.slice();
            copy.splice(copy.indexOf(product), 1);
            this.setState(
            ({
                products: copy
            }))
        },
        error => { 
            this.setState({
                msg: error.message,
                isLoading: false
            }) 
        })
    }

    handleInput(label, e)
    {
    var inp = Object.assign({}, this.state.model);
    inp[label] = e.target.value;
    this.setState({ model: inp });
    }

    handleSubmit(e)
    {
        e.preventDefault();
        if (this.state.model['id'] == '')
        {
            //nuovo
            this.setState({isLoading: true});
            fetch( '/api/products/', {
                method:'post',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.state.model)
            })
            .then(response => {
                if (!response.status >= 400) throw new Error("Errore server: caricamento dati");
                return response.json();
            })
            .then( data => {
                var reset = Object.assign({}, this.state.model);
                reset['id'] = '';
                reset['text'] = '';
                this.setState((prevState)=> ({
                    products: prevState.products.concat(data),
                    model: reset,
                    isLoading: false
                })
            )},
            error => { 
                this.setState({
                    msg: error.message,
                    isLoading: false
                }) 
            })
        }
        else
        {
            //modifica
            this.setState({isLoading: true});
            fetch( `/api/products/${this.state.model['id']}`, 
            {
                method: 'put',
                headers: 
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.state.model)
            })
            .then(response =>
            {
                if (!response.status >= 400) throw new Error("Errore server: caricamento dati");
                return response.json();
            })
            .then(data => 
            {
                let copy = this.state.products.slice();
                const index = copy.findIndex(el => {return el.id == this.state.model.id});
                copy.splice(index, 1, data);
                var reset = Object.assign({}, this.state.model);
                reset['id'] = '';
                reset['text'] = '';
                this.setState(
                ({
                    products: copy,
                    model: reset,
                    isLoading: false
                }))
            },
            error => { 
                this.setState({
                    msg: error.message,
                    isLoading: false
                }) 
            })
        }
        document.getElementsByName("id")[0].value = '';
        document.getElementsByName("text")[0].value = '';
    }

    handleFilter(e)
    {
        this.setState({searchInput: e.target.value});
        if (this.state.searchInput != '')
        {
            //filtra risultati - funzione filter!
            var search = this.state.products.filter(
                (element) => {
                    console.log(element);
                    return Object.values(element).join('').toLowerCase().includes(this.state.searchInput.toLowerCase())
                });
            this.setState({filtered: search});
        }
        else
        {
            //nessuna ricerca - svuoto filtered o posso lasciarlo sporco?
            this.setState({filtered: []})
        }
    }

    renderRows(data)
    {
        if (data.length > 0)
        {
            return(
                data.map( (element) => (    
                    <li key={element.id}>
                            {
                                this.state.model.id == element.id 
                                    ?
                                    <form onSubmit={(e) => this.handleSubmit(e)}>
                                        <input type="text" name="text" id="text" value={this.state.model.text} onChange={(e) => this.handleInput('text', e)} />
                                        <input type="hidden" name="id" value={this.state.model.id} />
                                        <button type="submit">Conferma</button>
                                    </form>
                                    :
                                    <p>{element.text} 
                                    <button onClick={() => this.handleModify(element)} className="ModifyElement">Modifica</button>
                                    <button onClick={() => this.handleDelete(element)} className="DeleteElement">Elimina</button></p> 
                            }
                    </li>
                    ))
            );
        }
        else
        {
            return(
                <p className="messages">Nessun risultato!</p>
            );
        }
    }

    render() {
        return ( 
            <div id="ShoppingList" className="container">

                <div class="p-5 my-4 bg-light rounded-3">
                    <h1>A useless shopping list</h1>
                </div>

                {this.state.isLoading ? <div className="loading">Caricamento...</div> : ''}

                {this.state.msg ? <div className="messages"><p>{this.state.msg}</p></div> : ''}

                <div className="row">
                    <div id="col-md-4">
                        <ul id="ProductsList">
                            <li id="Search">
                                <form name="SearchForm">
                                    <label>
                                        Filtra: 
                                        <input type="input" name="SearchInput" onChange={(e) => this.handleFilter(e)} />
                                    </label>
                                </form>
                            </li>
                            {this.state.searchInput.length > 0 ? this.renderRows(this.state.filtered) : this.renderRows(this.state.products)}
                            <li id="NewProduct">
                                <form onSubmit={(e) => this.handleSubmit(e)}>
                                    <input type="text" name="text" onChange={(e) => this.handleInput('text', e)} />
                                    <button type="submit">Invia</button>
                                </form>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default ShoppingList;

if (document.getElementById('root')) {
    ReactDOM.render(<ShoppingList />, document.getElementById('root'));
}