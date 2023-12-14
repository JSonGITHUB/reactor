import React from 'react';

export default class Repository extends React.Component {

    state = {
        repo: null
    };

    async getDetails(name) {
        return await fetch(`https://api.github.com/repos/${name}`, {
            mode: 'cors'
        }).then(res => res.json());
    }

    async componentDidMount() {
        const { name } = this.props;
        const repo = await this.getDetails(name);
        this.setState({ repo });
    }

    render() {
        const { repo } = this.state;

        if (!repo) {
            return <h1>Loading</h1>;
        }

        if (repo.message) {
            return <div className="Card Card--error">Error: {repo.message}</div>;
        }

        return (
            <div className="Card">
                <aside>
                    <img
                        width="48"
                        height="48"
                        className="Avatar"
                        src={repo.owner.avatar_url}
                        alt="Profile picture for ${repo.owner.login}"
                    />
                </aside>
                <header>
                    <h2 className="Card__title">{repo.full_name}</h2>
                    <span className="Card__meta">{repo.description}</span>
                </header>
            </div>
        );
    }
}