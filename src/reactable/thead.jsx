import React from 'react';
import { Th } from './th';
import { Filterer } from './filterer';
import { filterPropsFrom } from './lib/filter_props_from';

import { BtnPaginator } from './btnPaginator';
import { FiltererInput } from './filterer';

export class Thead extends React.Component {
    static getColumns(component) {
        // Can't use React.Children.map since that doesn't return a proper array
        let columns = [];
        React.Children.forEach(component.props.children, th => {
            var column = {};
            if (typeof th.props !== 'undefined') {
                column.props = filterPropsFrom(th.props);

                //set the label depending on the props
                if (typeof th.props.label !== 'undefined'){
                    column.label = th.props.label
                } else if (typeof th.props.children !== 'undefined'){
                    column.label = th.props.children
                } else if (typeof th.props.column === 'string') {
                    column.label = th.props.column;
                }

                // the key in the column attribute supersedes the one defined previously
                if (typeof th.props.column === 'string') {
                    column.key = th.props.column;
                } else {
                    // use the content as the key
                    column.key = th.props.children;
                }
            }

            if (typeof column.key === 'undefined') {
                throw new TypeError(
                    '<th> must have either a "column" property or a string ' +
                    'child');
            } else {
                columns.push(column);
            }
        });

        return columns;
    }

    handleClickTh(column) {
        this.props.onSort(column.key);
    }

    handleKeyDownTh(column, event) {
      if (event.keyCode === 13) {
        this.props.onSort(column.key);
      }
    }
    
    scrollIntoView() {
      if (this.domEl && this.domEl.offsetParent === null) {
            this.domEl.scrollIntoView();
        }
    }

    render() {
        const {sort, sortableColumns, filtering, columns, onFilter, onClean, filterPlaceholder, currentFilter, topPagination, middlePagination, filterCleanBtn, locale, itemsPerPage, itemsNumber, numPages, currentPage, onPageChange, topPaginationElem, middlePaginationElem} = this.props;

        // Declare the list of Ths
        var Ths = [];
        for (var index = 0; index < columns.length; index++) {
            var column = columns[index];
            var thClass = `reactable-th-${column.key.replace(/\s+/g, '-').toLowerCase()}`;
            var sortClass = '';

            if (sortableColumns[column.key]) {
                sortClass += 'reactable-header-sortable ';
            }

            if (sort.column === column.key) {
                sortClass += 'reactable-header-sort';
                if (sort.direction === 1) {
                    sortClass += '-asc';
                }
                else {
                    sortClass += '-desc';
                }
            }

            if (sortClass.length > 0) {
              thClass += ` ${sortClass}`;
            }

            if (
                typeof(column.props) === 'object' &&
                typeof(column.props.className) === 'string'
            ) {
                thClass += ` ${column.props.className}`;
            }

            Ths.push(
                <Th {...column.props}
                    className={thClass}
                    key={index}
                    onClick={this.handleClickTh.bind(this, column)}
                    onKeyDown={this.handleKeyDownTh.bind(this, column)}
                    role="button"
                    tabIndex="0">
                    {column.label}
                </Th>
            );
        }

        // Manually transfer props
        var props = filterPropsFrom(this.props);
        return (
            <thead {...{...props, ref: (el => this.domEl = el)}}>
                {!topPagination && filtering &&
                    <Filterer
                        colSpan={columns.length}
                        onFilter={onFilter}
                        placeholder={filterPlaceholder}
                        value={currentFilter}
                    />
                }
                {topPagination ?
                    <tr className="reactable-btnPagination">
                        <td colSpan={columns.length}>
                            <div className="reactable-topDesign">
                                <div className="reactable-leftElem">
                                    {topPaginationElem.left}
                                </div>
                                <div className={filtering ? 'reactable-mainElem' : 'reactable-mainElem no-filter'}>
                                    {filtering &&
                                        <FiltererInput
                                            filterCleanBtn={filterCleanBtn}
                                            onClean={onClean}
                                            onFilter={onFilter}
                                            placeholder={filterPlaceholder}
                                            value={currentFilter}
                                        />
                                    }
                                    <BtnPaginator
                                        locale={locale}
                                        itemsPerPage={itemsPerPage}
                                        itemsNumber={itemsNumber}
                                        numPages={numPages}
                                        currentPage={currentPage}
                                        onPageChange={onPageChange}
                                        key="paginator"
                                    />
                                </div>
                                <div className="reactable-rightElem">
                                    {topPaginationElem.right}
                                </div>
                            </div>
                        </td>
                    </tr> : null
                }
                {middlePagination ?
                    <tr className="reactable-btnPagination">
                        <td colSpan={columns.length}>
                            <div className="reactable-topDesign">
                                {middlePaginationElem}
                            </div>
                        </td>
                    </tr> : null
                }
                <tr className="reactable-column-header">{Ths}</tr>
            </thead>
        );
    }
};
