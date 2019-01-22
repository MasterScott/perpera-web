import * as React from 'react';
import Loader from 'src/components/Loader/Loader';
import ObservableHelper from 'src/helpers/Observable';
import PerperaService from 'src/services/Perpera';
import './RegisterPopup.css';

interface IState {
  errorMsg: string;
  fileName: string;
  hash: string;
  isLoading: boolean;
  isOpen: boolean;
  wif: string;
  originalHash?: string;
}

class RegisterPopup extends React.Component<{}, IState> {
  constructor(props: any) {
    super(props);

    this.state = {
      errorMsg: '',
      fileName: '',
      hash: '',
      isLoading: false,
      isOpen: false,
      wif: '',
    }

    this.handleForm = this.handleForm.bind(this);
    this.close = this.close.bind(this);
    this.handleWIF = this.handleWIF.bind(this);
  }

  public componentWillMount() {
    ObservableHelper.on('onNewFileHash', (payload: any) => {
      this.setState({
        fileName: payload.fileName,
        hash: payload.hash,
        isOpen: true,
        originalHash: ''
      });
    });
    ObservableHelper.on('onUpdateFileHash', (payload: any) => {
      this.setState({
        fileName: payload.fileName,
        hash: payload.hash,
        isOpen: true,
        originalHash: payload.originalHash
      });
    });
  }

  public async handleForm(e: any) {
    e.preventDefault();
    this.setState({ isLoading: true });

    const perperaService = new PerperaService();

    try {
      if (this.state.originalHash) {
        await perperaService.updateDocument(this.state.originalHash, this.state.hash, this.state.wif);
      } else {
        await perperaService.setDocument(this.state.hash, this.state.wif);
      }
      this.setState({ isLoading: false });
    } catch(e) {
      if (e.toString().includes('Insufficient funds')) {
        this.setState({ errorMsg: 'Your wallet has no funds.',  isLoading: false });
        return;
      }
      this.setState({ errorMsg: 'WIF invalid.',  isLoading: false });
    }
  }

  public handleWIF(e: any) {
    this.setState({errorMsg: '', wif: e.target.value});
  }

  public close() {
    this.setState({ isOpen: false, isLoading: false });
  }

  public render() {
    return (
      <div className={this.state.isOpen ? 'RegisterPopupComp open' : 'RegisterPopupComp'}>
        {this.state.isLoading && <Loader />}
        {this.state.isOpen && (
          <div className="register-popup">
            <button className="close" onClick={this.close}><img src="/img/icon-close.svg" alt="Close Popup"/></button>
            <div className="file">
              <img src="/img/icon-file.svg" alt="File" className="file-icon"/>
              <span>{this.state.fileName}</span>
            </div>
            
            <div className="hash">
              <div className="label">sha256</div>
              <div className="hash-string">{this.state.hash}</div>
            </div>
            
            <p>Saving this hash on blockchain will cost you a transaction fee of <b className="bold-green">0.01 PPC</b>.</p>

            <form className="form" onSubmit={this.handleForm}>
              <label>Insert your WIF:</label>
              <textarea className="form-field" autoCorrect="false" placeholder="Type WIF here..." value={this.state.wif} onChange={this.handleWIF} />
              {this.state.errorMsg && <div className="error-msg">{this.state.errorMsg}</div>}
              <button className="form-submit">{this.state.originalHash ? 'Update' : 'Register'} Document</button>
            </form>

            <p>After registering, you will have to wait up to 1 hour in order for it to fully propagate to the blockchain.</p>
          </div>
        )}
      </div>
    );
  }
}

export default RegisterPopup;