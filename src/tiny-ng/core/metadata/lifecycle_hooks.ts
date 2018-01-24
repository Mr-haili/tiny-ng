/**
 * @whatItDoes Lifecycle hook that is called after data-bound properties of a directive are
 * initialized.
 *
 * `ngOnInit` is called right after the directive's data-bound properties have been checked for the
 * first time, and before any of its children have been checked. It is invoked only once when the
 * directive is instantiated.
 */
export interface OnInit { ngOnInit(): void; }
