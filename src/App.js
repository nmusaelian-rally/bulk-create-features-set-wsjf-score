Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',
    scopeType: 'release',
    comboboxConfig: {
        fieldLabel: 'Select a Release:',
        labelWidth: 100,
        width: 300
    },
    
    onScopeChange: function() {
        this._getRelease();
    },
    
    
    _getRelease: function() {
            var release = this.getContext().getTimeboxScope().record.get('_ref');
            console.log('release',release);
            
            if (!this.down('#b2')) {
                 var that = this;
                 var cb = Ext.create('Ext.Container', {
            
                items: [
                    {
                        xtype  : 'rallybutton',
                        text      : 'create',
                        id: 'b2',
                        handler: function() {
                            that._getModel(release); 
                        }
                    }
                        
                    ]
                });
            this.add(cb);
            }
        },
        

    _getModel: function(release){
            var that = this;
            Rally.data.ModelFactory.getModel({
                type: 'PortfolioItem/Feature',
                context: {
                    workspace: '/workspace/1448050317'         //non default workspace NMx
                },
                success: function(model) {  //success on model retrieved
                    var count = 25;
                    for(var i=1;i<count;i++){
                        that._model = model;
                    var feature = Ext.create(model, {
                        Name: 'feature F' + i,
                        JobSize: i + 1,
                        UserBusinessValue: i*3,
                        RROEValue: i*2,
                        TimeCriticality: i + 2
                    });
                    feature.save({
                        callback: function(result, operation) {
                            if(operation.wasSuccessful()) {
                                console.log("_ref",result.get('_ref'), ' ', result.get('Name'));
                                that._record = result;
                                that._readAndUpdate(release);
                            }
                            else{
                                console.log("?");
                            }
                        }
                    });
                    }
                    
                }
            });
        },
        
        _readAndUpdate:function(release){
            var id = this._record.get('ObjectID');
            console.log('OID', id);
            this._model.load(id,{
                fetch: ['Name', 'FormattedID', 'Release', 'JobSize', 'UserBusinessValue', 'RROEValue', 'TimeCriticality'],
                callback: function(record, operation){
                    console.log('Release prior to update:', record.get('Release'));
                    record.set('Release', release);
                    record.set('Project', '/project/3053916131')
                    var jobSize = parseInt(record.get('JobSize') + "", 10); // parse int ensures we are dealing with ints, base 10
                    var timeValue = parseInt(record.get('TimeCriticality') + "", 10);
                    var rroeValue = parseInt(record.get('RROEValue') + "", 10);
                    var userValue = parseInt(record.get('UserBusinessValue') + "", 10);
            
                        if (jobSize > 0) { // jobSize is the denominator so make sure it's not 0
                            var score = ~~ (((userValue + timeValue + rroeValue) / jobSize) + 0.5); // shortcut for casting to int
                        } 
                    record.set('WSJFScore', score);
                    record.save({
                        callback: function(record, operation) {
                            if(operation.wasSuccessful()) {
                                console.log('Release after update..', record.get('Release'));
                            }
                            else{
                                console.log("problem..");
                            }
                        }
                    });
                }
            })
        }
});
