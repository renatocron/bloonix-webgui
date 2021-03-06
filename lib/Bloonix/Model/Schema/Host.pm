package Bloonix::Model::Schema::Host;

use strict;
use warnings;
use base qw(Bloonix::DBI::Base);
use base qw(Bloonix::DBI::CRUD);

sub init {
    my $self = shift;

    $self->set_unique(and => [ "company_id", "hostname" ]);

    $self->action(
        pre_create => sub {
            my ($self, $data) = @_;
            $data->{status_nok_since} = $data->{last_check} = time;
            $data->{facts} = "{}";
            $data->{variables} ||= "{}";
        }
    );
}

sub set {
    my ($self, $user) = @_;

    if (!$user || ref $user ne "HASH") {
        die "no user set";
    }

    my (@company, $company);

    if ($user->{role} eq "admin") {
        $company = $self->schema->company->all;
    } else {
        $company = [ $self->schema->company->get($user->{company_id}) ];
    }

    foreach my $comp (@$company) {
        push @company, {
            name  => $comp->{company},
            value => $comp->{id},
        };
    }

    $self->validator->set(
        company_id => {
            options => \@company,
            default => $user->{company_id},
        },
        password => {
            regex => qr/^\w{30,128}\z/,
        },
        hostname =>  {
            regex => qr/^[\w\.\-]{3,64}\z/,
        },
        description => {
            min_size => 1,
            max_size => 100,
        },
        comment => {
            max_size => 100,
            optional => 1,
        },
        sysgroup => {
            regex => qr/^.{0,50}\z/,
            optional => 1,
        },
        sysinfo => {
            regex => qr!^(?:|https{0,1}://[\w\.\-]+(?:/|/[^"'<>\\]+))\z!,
            max_size => 200,
            optional => 1,
        },
        device_class => {
            max_size => 100,
            regex => qr!^/.+!,
            default => "/Server"
        },
        hw_manufacturer => {
            max_size => 50,
            optional => 1,
        },
        hw_product => {
            max_size => 50,
            optional => 1,
        },
        os_manufacturer => {
            max_size => 50,
            optional => 1,
        },
        os_product => {
            max_size => 50,
            optional => 1,
        },
        virt_manufacturer => {
            max_size => 50,
            optional => 1,
        },
        virt_product => {
            max_size => 50,
            optional => 1,
        },
        location => {
            max_size => 100,
            optional => 1,
        },
        coordinates => {
            options => $self->c->plugin->ccodes->country,
            default => "DE"
        },
        ipaddr =>  {
            regex => $self->validator->regex->ipaddr
        },
        active =>  {
            options  => [1,0],
            default  => 1,
            optional => 1,
        },
        allow_from =>  {
            constraint => sub {
                return undef unless $_[0];
                $_[0] =~ s/\s//g;

                if ($_[0] eq "all") {
                    return 1;
                }

                foreach my $ip (split /,/, $_[0]) {
                    if ($ip !~ $self->validator->regex->ipaddr) {
                        return 0;
                    }
                }

                return 1;
            },
            max_size => 300,
            default  => "all",
        },
        interval => {
            options => [
                ($self->c->config->{webapp}->{check_frequency} eq "high" ? (15, 30) : ()),
                60, 120, 300, 600, 900, 1800, 3600, 7200, 14400, 28800, 43200, 57600, 86400
            ],
            default => 60,
        },
        timeout => {
            options => [
                ($self->c->config->{webapp}->{check_frequency} eq "high" ? (30, 60, 120) : ()),
                180, 300, 600, 900, 1800, 3600
            ],
            default => 300,
        },
        max_sms => {
            # 0 is not unlimited
            min_val => 0,
            max_val => 99999,
            default => 500,
        },
        notification => {
            options => [1,0],
            default => 1,
        },
        max_services => {
            min_val => 0,
            max_val => 9999,
            default => 0,
        },
        variables => {
            constraint => sub {
                return 1 unless $_[0];
                foreach my $pv (split /[\r\n]+/, $_[0]) {
                    next if $pv =~ /^\s*\z/;
                    if ($pv !~ /^\s*[a-zA-Z_0-9\.]+\s*=\s*([^\s].*)\z/) {
                        return undef;
                    }
                }
                return 1;
            },
            default => "{}"
        },
        data_retention => {
            min_val => 0,
            max_val => 32767,
            default => 3650
        }
    );
}

sub by_user_id {
    my $self = shift;
    my $opts = {@_};
    my $user = $opts->{user};
    my @condition;

    #if ($user->{role} eq "operator") {
    #    push @condition, (
    #        where => {
    #            table => "host",
    #            column => "company_id",
    #            value => $user->{company_id}
    #        }
    #    );
    #} else {
        push @condition, (
            where => {
                table => "user_group",
                column => "user_id",
                value => $user->{id}
            }
        );
    #}

    if ($opts->{condition}) {
        push @condition, pre => [ and => @{$opts->{condition}} ];
    }

    my @select = (
        distinct => 1,
        table    => [
            host => "*",
            company => [ "id AS company_id", "company" ],
            status_priority => "priority",
        ],
        join => [
            inner => {
                table => "host_group",
                left  => "host.id",
                right => "host_group.host_id",
            },
            inner => {
                table => "user_group",
                left  => "host_group.group_id",
                right => "user_group.group_id",
            },
            inner => {
                table => "company",
                left  => "host.company_id",
                right => "company.id",
            },
            inner => {
                table => "status_priority",
                left  => "host.status",
                right => "status_priority.status",
            },
        ],
        condition => \@condition
    );

    if ($opts->{sort}) {
        push @select, order => [ $opts->{sort}->{type} => $opts->{sort}->{by} ];
    } elsif ($opts->{order}) {
        push @select, order => $opts->{order};
    }

    my ($count, $hosts) = $self->dbi->query(
        offset => $opts->{offset},
        limit => $opts->{limit},
        query => $opts->{query},
        maps => {
            h => "host.hostname", hostname => "host.hostname",
            a => "host.ipaddr", ipaddr => "host.ipaddr",
            s => "host.status", status => "host.status",
            g => "host.sysgroup", sysgroup => "host.sysgroup",
            l => "host.location", location => "host.location",
            c => "host.coordinates", coordinates => "host.coordinates",
            d => "host.device_class", device_class => "host.device_class"
        },
        concat => [
            "host.id", "host.hostname", "host.ipaddr", "host.description",
            "host.status", "host.sysgroup", "host.location"
        ],
        delimiter => " ",
        count => "host.id",
        select => \@select,
    );

    return ($count, $hosts);
}

sub _is_group_member {
    my ($self, $opts) = @_;
    my $user = $opts->{user};

    my %select = (
        join => [
            inner => {
                table => "host_group",
                left  => "host.id",
                right => "host_group.host_id",
            },
        ],
        condition => [
            where => {
                table => "host_group",
                column => "group_id",
                value => $opts->{is_in_group} // $opts->{is_not_in_group}
            }
        ]
    );

    if ($user->{role} ne "admin") {
        push @{$select{condition}}, (
            and => {
                table => "host",
                column => "company_id",
                value => $user->{company_id}
            }
        );
    }

    return \%select;
}

sub _is_not_group_member {
    my ($self, $opts) = @_;
    my $user = $opts->{user};
    my $group_select = $self->_is_group_member($opts);

    my %select = (
        condition => [
            where => {
                table => "host",
                column => "id",
                op => "not in",
                value => {
                    distinct => 1,
                    table => "host",
                    column => "id",
                    %$group_select
                }
            }
        ]
    );

    if ($user->{role} ne "admin") {
        push @{$select{condition}}, (
            and => {
                table => "host",
                column => "company_id",
                value => $user->{company_id}
            }
        );
    }

    return \%select;
}

sub search_group_member {
    my ($self, $opts) = (shift, {@_});

    my $select = defined $opts->{is_in_group}
        ? $self->_is_group_member($opts)
        : $self->_is_not_group_member($opts);

    my @select = (
        distinct => 1,
        table => "host",
        column => [qw(id hostname ipaddr)],
        %$select,
        order => [ asc => "id" ]
    );

    my ($count, $hosts) = $self->dbi->query(
        offset => $opts->{offset},
        limit => $opts->{limit},
        query => $opts->{query},
        maps => {
            h => "host.hostname", hostname => "host.hostname",
            a => "host.ipaddr", ipaddr => "host.ipaddr"
        },
        concat => [
            "host.id", "host.hostname", "host.ipaddr"
        ],
        delimiter => " ",
        count => "host.id",
        select => \@select
    );

    return ($count, $hosts);
}

sub _is_contactgroup_member {
    my ($self, $opts) = @_;
    my $user = $opts->{user};

    my %select = (
        distinct => 1,
        table => "host",
        column => [qw(id hostname ipaddr)],
        join => [
            inner => {
                table => "host_contactgroup",
                left  => "host.id",
                right => "host_contactgroup.host_id"
            },
            inner => {
                table => "host_group",
                left  => "host.id",
                right => "host_group.host_id",
            },
            inner => {
                table => "user_group",
                left  => "host_group.group_id",
                right => "user_group.group_id",
            }
        ],
        condition => [
            where => {
                table => "user_group",
                column => "user_id",
                value => $user->{id}
            },
            and => {
                table => "host_contactgroup",
                column => "contactgroup_id",
                value => $opts->{contactgroup_id}
            }
        ],
        order => [ asc => "id" ]
    );

    if ($user->{role} ne "admin") {
        push @{$select{condition}}, (
            and => {
                table => "host",
                column => "company_id",
                value => $user->{company_id}
            }
        );
    }

    return %select;
}

sub _is_not_contactgroup_member {
    my ($self, $opts) = @_;
    my $user = $opts->{user};

    my %select = (
        distinct => 1,
        table => "host",
        column => [qw(id hostname ipaddr)],
        join => [
            inner => {
                table => "host_group",
                left  => "host.id",
                right => "host_group.host_id"
            },
            inner => {
                table => "user_group",
                left  => "host_group.group_id",
                right => "user_group.group_id"
            }
        ],
        condition => [
            where => {
                table => "user_group",
                column => "user_id",
                value => $user->{id}
            },
            and => {
                table => "host",
                column => "id",
                op => "not in",
                value => {
                    distinct => 1,
                    table => "host_contactgroup",
                    column => "host_id",
                    condition => [
                        where => {
                            table => "host_contactgroup",
                            column => "contactgroup_id",
                            value => $opts->{contactgroup_id}
                        }
                    ]
                }
            }
        ],
        order => [ asc => "id" ]
    );

    if ($user->{role} ne "admin") {
        push @{$select{condition}}, (
            and => {
                table => "host",
                column => "company_id",
                value => $user->{company_id}
            }
        );
    }

    return %select;
}

sub search_contactgroup_member {
    my ($self, $opts) = (shift, {@_});

    my @select = $opts->{is_in_group} 
        ? $self->_is_contactgroup_member($opts)
        : $self->_is_not_contactgroup_member($opts);

    my ($count, $hosts) = $self->dbi->query(
        offset => $opts->{offset},
        limit => $opts->{limit},
        query => $opts->{query},
        maps => {
            hostname => "host.hostname",
            ipaddr => "host.ipaddr"
        },
        concat => [
            "host.id", "host.hostname", "host.ipaddr"
        ],
        delimiter => " ",
        count => "host.id",
        select => \@select
    );

    return ($count, $hosts);
}

sub by_host_and_user_id {
    my ($self, $host_id, $user_id) = @_;

    my @stmt = (
        distinct => 1,
        table => [
            host => "*",
            company => "company",
        ],
        join => [
            inner => {
                table => "host_group",
                left  => "host.id",
                right => "host_group.host_id",
            },
            inner => {
                table => "user_group",
                left  => "host_group.group_id",
                right => "user_group.group_id",
            },
            inner => {
                table => "company",
                left => "host.company_id",
                right => "company.id",
            },
        ],
    );

    if ($host_id =~ /^\d+\z/) {
        push @stmt, condition => [
            "host.id" => $host_id,
            "user_group.user_id" => $user_id,
        ];
    } else {
        push @stmt, condition => [
            "host.hostname" => $host_id,
            "user_group.user_id" => $user_id,
        ];
    }

    my ($stmt, @bind) = $self->sql->select(@stmt);

    return $self->dbi->unique($stmt, @bind);
}

sub ids_by_user_id {
    my ($self, $user_id) = @_;

    my ($stmt, @bind) = $self->sql->select(
        distinct => 1,
        table => "host",
        column => "id",
        join => [
            inner => {
                table => "host_group",
                left  => "host.id",
                right => "host_group.host_id",
            },
            inner => {
                table => "user_group",
                left  => "host_group.group_id",
                right => "user_group.group_id",
            },
        ],
        condition => [
            where => {
                table => "user_group",
                column => "user_id",
                value => $user_id,
            }
        ],
    );

    return $self->dbi->fetch($stmt, @bind);
}

sub ids_of_latest_status_changes {
    my ($self, $user_id, $time, $limit, $host_ids) = @_;
    $limit //= 15;

    my %stmt = (
        distinct => 1,
        table => "host",
        column => [ "id", "status_since" ],
        join => [
            inner => {
                table => "host_group",
                left  => "host.id",
                right => "host_group.host_id",
            },
            inner => {
                table => "user_group",
                left  => "host_group.group_id",
                right => "user_group.group_id",
            },
        ],
        condition => [
            where => {
                table => "user_group",
                column => "user_id",
                value => $user_id,
            },
            and => {
                table => "host",
                column => "status_since",
                op => ">=",
                value => $time
            }
        ],
        order => [
            desc => "host.status_since"
        ],
        limit => $limit
    );

    if ($host_ids) {
        push @{$stmt{condition}}, and => {
            table => "host",
            column => "id",
            value => $host_ids
        };
    }

    my ($stmt, @bind) = $self->sql->select(%stmt);
    return $self->dbi->fetch($stmt, @bind);
}

sub textsearch {
    my ($self, %opts) = @_;

    my ($stmt, @bind) = $self->sql->select(
        distinct => 1,
        table => [ host => "*" ],
        join => [
            inner => {
                table => "host_group",
                left  => "host.id",
                right => "host_group.host_id",
            },
            inner => {
                table => "user_group",
                left  => "host_group.group_id",
                right => "user_group.group_id",
            },
        ],
        condition => [
            where => {
                table => "user_group",
                column => "user_id",
                value => $opts{user_id},
            },
            pre => [
                and => $self->_search($opts{query}),
            ],
        ],
        order => [
            asc => "host.hostname"
        ],
        limit => $opts{limit},
    );

    return $self->dbi->fetch($stmt, @bind);
}

sub stats_count_by_user_id {
    my ($self, $user_id, $key) = @_;

    my ($stmt, @bind) = $self->sql->select(
        table  => "host",
        column => [
            $key,
            { function => "count", column => $key, "alias" => "count" },
        ],
        condition => [
            where => {
                distinct => 1,
                table => "host",
                column => "id",
                op => "in",
                value => {
                    table => "host",
                    column => "id",
                    join => [
                        inner => {
                            table => "host_group",
                            left  => "host.id",
                            right => "host_group.host_id"
                        },
                        inner => {
                            table => "user_group",
                            left  => "host_group.group_id",
                            right => "user_group.group_id"
                        },
                    ],
                    condition => [
                        "user_group.user_id" => $user_id
                    ]
                }
            }
        ],
        group_by => [ $key ]
    );

    return $self->dbi->fetch($stmt, @bind);
}

sub stats_count_country_by_user_id {
    my ($self, $user_id) = @_;

    my ($stmt, @bind) = $self->sql->select(
        distinct => 1,
        table => "host",
        column => [ qw(id status coordinates) ],
        join => [
            inner => {
                table => "host_group",
                left  => "host.id",
                right => "host_group.host_id",
            },
            inner => {
                table => "user_group",
                left  => "host_group.group_id",
                right => "user_group.group_id",
            },
        ],
        condition => [
            where => {
                table => "user_group",
                column => "user_id",
                value => $user_id,
            }
        ]
    );

    my $sth = $self->dbi->execute($stmt, @bind);
    my $data = { };

    while (my $row = $sth->fetchrow_hashref) {
        my $location = "n/a";

        if ($row->{coordinates} =~ /^([a-zA-Z]{2})/) {
            $location = $1;
        }

        if (!exists $data->{$location}) {
            $data->{$location} = { qw(total 0 OK 0 INFO 0 WARNING 0 CRITICAL 0 UNKNOWN 0) };
        }

        $data->{$location}->{total}++;
        $data->{$location}->{ $row->{status} }++;
    }

    return $data;
}

sub simple_search {
    my ($self, $user_id, $string) = @_;

    $string =~ s/[^a-zA-Z0-9\-\.%]//g;
    $string =~ s/^%//;
    $string =~ s/%\z//;

    my ($stmt, @bind) = $self->sql->select(
        distinct => 1,
        table => "host",
        column => [ qw(id hostname ipaddr) ],
        join => [
            inner => {
                table => "host_group",
                left  => "host.id",
                right => "host_group.host_id",
            },
            inner => {
                table => "user_group",
                left  => "host_group.group_id",
                right => "user_group.group_id",
            },
        ],
        condition => [
            where => {
                table => "user_group",
                column => "user_id",
                value => $user_id,
            },
            and => {
                table => "host",
                column => "hostname",
                op => "like",
                value => "%$string%"
            }
        ],
        order => [
            asc => "hostname"
        ],
        limit => 10
    );

    return $self->dbi->fetch($stmt, @bind);
}

sub count_by_company_id {
    my ($self, $id) = @_;

    my ($stmt, @bind) = $self->sql->select(
        table => $self->{table},
        count => "id",
        condition => [ company_id => $id ],
    );

    return $self->dbi->count($stmt, @bind);
}

sub warnings_by_user_id {
    my ($self, $user_id, $offset, $limit) = @_;
    $offset //= 0;
    $limit //= 40;

    my ($stmt, @bind) = $self->sql->select(
        distinct => 1,
        table => [
            host => [ "id", "hostname", "ipaddr", "status", "last_check" ],
            status_priority => "priority"
        ],
        join => [
            inner => {
                table => "host_group",
                left  => "host.id",
                right => "host_group.host_id",
            },
            inner => {
                table => "user_group",
                left  => "host_group.group_id",
                right => "user_group.group_id",
            },
            inner => {
                table => "status_priority",
                left  => "host.status",
                right => "status_priority.status",
            },
        ],
        condition => [
            where => {
                table => "user_group",
                column => "user_id",
                value => $user_id,
            },
            and => {
                table => "host",
                column => "active",
                value => 1,
            },
        ],
        order => [
            desc => [ "status_priority.priority", "host.last_check" ]
        ],
        offset => 0,
        limit => $limit
    );

    return $self->dbi->fetch($stmt, @bind);
}

sub get_invalid_host_ids_by_user_id {
    my ($self, $user_id, $host_ids) = @_;
    my %check_ids = map { $_ => 1 } @$host_ids;
    @$host_ids = grep /^\d+\z/, @$host_ids;

    my ($stmt, @bind) = $self->sql->select(
        distinct => 1,
        table => "host",
        column => "id",
        join => [
            inner => {
                table => "host_group",
                left  => "host.id",
                right => "host_group.host_id"
            },
            inner => {
                table => "user_group",
                left  => "host_group.group_id",
                right => "user_group.group_id"
            }
        ],
        condition => [
            where => {
                table => "user_group",
                column => "user_id",
                value => $user_id
            },
            and => {
                table => "host",
                column => "id",
                op => "in",
                value => $host_ids
            }
        ]
    );

    my $sth = $self->dbi->execute($stmt, @bind);

    while (my $row = $sth->fetchrow_hashref) {
        delete $check_ids{ $row->{id} };
    }

    $sth->finish;
    return scalar keys %check_ids ? [ keys %check_ids ] : undef;
}

sub validate_host_ids_by_company_id {
    my ($self, $company_id, $host_ids) = @_;

    my ($stmt, @bind) = $self->sql->select(
        count => "id",
        table => "host",
        condition => [
            where => {
                table => "host",
                column => "company_id",
                value => $company_id
            },
            and => {
                table => "host",
                column => "id",
                value => $host_ids
            },
        ]
    );

    my $count = $self->dbi->count($stmt, @bind);

    return $count == @$host_ids;
}

sub system_categories {
    my ($self, $company_id) = @_;
    my %data;

    my @cols = qw(
        sysgroup sysinfo device_class hw_manufacturer hw_product os_manufacturer
        os_product virt_manufacturer virt_product location
    );

    foreach my $col (@cols) {
        $data{$col} = [];

        my $sth = $self->dbi->execute(
            $self->sql->select(
                distinct => 1,
                table => "host",
                column => $col,
                condition => [ company_id => $company_id ]
            )
        );

        while (my $row = $sth->fetchrow_hashref) {
            if ($row->{$col}) {
                push @{$data{$col}}, $row->{$col};
            }
        }
    }

    my %device_classes = map { $_ => 0 } (
        @{$data{device_class}}, "/Server", "/vServer", "/Printer", "/Network", "/Database", "/Power"
    );

    $data{device_class} = [ keys %device_classes ];

    return \%data;
}

sub get_template_groups {
    my ($self, $company_id, $host_id) = @_;

    my ($stmt, @bind) = $self->sql->select(
        distinct => 1,
        table => "host_template",
        column => "*",
        join => [
            inner => {
                table => "host_template_host",
                left => "host_template_host.host_template_id",
                right => "host_template.id"
            }
        ],
        condition => [
            where => {
                table => "host_template_host",
                column => "host_id",
                value => $host_id
            }
        ]
    );

    my $host_is_member_in_group = $self->dbi->fetch($stmt, @bind);
    my @host_template_ids = (0);

    foreach my $host_template (@$host_is_member_in_group) {
        push @host_template_ids, $host_template->{id};
    }

    ($stmt, @bind) = $self->sql->select(
        table => "host_template",
        column => "*",
        condition => [
            where => {
                column => "company_id",
                value => $company_id
            },
            and => {
                column => "id",
                op => "not in",
                value => \@host_template_ids
            }
        ]
    );

    my $host_is_not_member_in_group = $self->dbi->fetch($stmt, @bind);

    return {
        is_member_in => $host_is_member_in_group,
        is_not_member_in => $host_is_not_member_in_group
    };
}

sub group_by_device_class {
    my ($self, $user_id) = @_;

    my ($stmt, @bind) = $self->sql->select(
        table => "host",
        column => [
            "device_class", "status",
            { function => "count", column => "id", "alias" => "count" }
        ],
        condition => [
            where => {
                table => "host",
                column => "id",
                op => "in",
                value => {
                    distinct => 1,
                    table => "host",
                    column => "id",
                    join => [
                        inner => {
                            table => "host_group",
                            left  => "host.id",
                            right => "host_group.host_id"
                        },
                        inner => {
                            table => "user_group",
                            left  => "host_group.group_id",
                            right => "user_group.group_id"
                        }
                    ],
                    condition => [
                        where => {
                            table => "user_group",
                            column => "user_id",
                            value => $user_id
                        }
                    ]
                }
            }
        ],
        group_by => [ "device_class", "status" ]
    );

    return $self->dbi->fetch($stmt, @bind);
}

sub count_downtimes {
    my ($self, $host_id) = @_;

    my $count_host_downtimes = $self->schema->host_downtime->count(
        host_id => condition => [ host_id => $host_id ]
    );

    my $count_service_downtimes = $self->schema->service_downtime->count(
        service_id => condition => [ host_id => $host_id ]
    );

    return $count_host_downtimes + $count_service_downtimes;
}

sub no_privileges_to_create_service {
    my $self = shift;
    return $self->_no_privileges(create_service => @_);
}

sub no_privileges_to_modify_service {
    my $self = shift;
    return $self->_no_privileges(update_service => @_);
}

sub no_privileges_to_delete_service {
    my $self = shift;
    return $self->_no_privileges(delete_service => @_);
}

sub no_privileges_to_create_host {
    my $self = shift;
    return $self->_no_privileges(create_host => @_);
}

sub no_privileges_to_modify_host {
    my $self = shift;
    return $self->_no_privileges(update_host => @_);
}

sub no_privileges_to_delete_host {
    my $self = shift;
    return $self->_no_privileges(delete_host => @_);
}

sub _no_privileges {
    my ($self, $action, $user_id, $host_ids) = @_;
    my %check_ids = map { $_ => 1 } @$host_ids;
    @$host_ids = grep /^\d+\z/, @$host_ids;

    my ($stmt, @bind) = $self->sql->select(
        distinct => 1,
        table => "host_group",
        column => "host_id",
        join => [
            inner => {
                table => "user_group",
                left  => "host_group.group_id",
                right => "user_group.group_id"
            }
        ],
        condition => [
            where => {
                table => "user_group",
                column => "user_id",
                value => $user_id
            },
            and => {
                table => "user_group",
                column => $action,
                value => 1
            }
        ]
    );

    my $sth = $self->dbi->execute($stmt, @bind);

    while (my $row = $sth->fetchrow_hashref) {
        delete $check_ids{ $row->{host_id} };
    }

    $sth->finish;
    return scalar keys %check_ids ? [ keys %check_ids ] : undef;
}

# -------------------------------------
# host template member
# -------------------------------------

sub search_template_member {
    my ($self, $opts) = (shift, {@_});

    my @select = $opts->{is_in_group}
        ? $self->_is_template_member($opts)
        : $self->_is_not_template_member($opts);

    my ($count, $hosts) = $self->dbi->query(
        offset => $opts->{offset},
        limit => $opts->{limit},
        query => $opts->{query},
        maps => {
            hostname => "host.hostname",
            ipaddr => "host.ipaddr"
        },
        concat => [
            "host.id", "host.hostname", "host.ipaddr"
        ],
        delimiter => " ",
        count => "host.id",
        select => \@select
    );

    return ($count, $hosts);
}

sub _is_template_member {
    my ($self, $opts) = @_;
    my $user = $opts->{user};

    my %select = (
        distinct => 1,
        table => "host",
        column => [qw(id hostname ipaddr)],
        join => [
            inner => {
                table => "host_template_host",
                left  => "host.id",
                right => "host_template_host.host_id"
            },
            inner => {
                table => "host_group",
                left  => "host.id",
                right => "host_group.host_id",
            },
            inner => {
                table => "user_group",
                left  => "host_group.group_id",
                right => "user_group.group_id",
            }
        ],
        condition => [
            where => {
                table => "user_group",
                column => "user_id",
                value => $user->{id}
            },
            and => {
                table => "host_template_host",
                column => "host_template_id",
                value => $opts->{host_template_id}
            },
            and => {
                table => "host",
                column => "company_id",
                value => $user->{company_id}
            }
        ],
        order => [ asc => "hostname" ]
    );

    return %select;
}

sub _is_not_template_member {
    my ($self, $opts) = @_;
    my $user = $opts->{user};

    my %select = (
        distinct => 1,
        table => "host",
        column => [qw(id hostname ipaddr)],
        join => [
            inner => {
                table => "host_group",
                left  => "host.id",
                right => "host_group.host_id"
            },
            inner => {
                table => "user_group",
                left  => "host_group.group_id",
                right => "user_group.group_id"
            }
        ],
        condition => [
            where => {
                table => "user_group",
                column => "user_id",
                value => $user->{id}
            },
            and => {
                table => "host",
                column => "id",
                op => "not in",
                value => {
                    distinct => 1,
                    table => "host_template_host",
                    column => "host_id",
                    condition => [
                        where => {
                            table => "host_template_host",
                            column => "host_template_id",
                            value => $opts->{host_template_id}
                        }
                    ]
                }
            },
            and => {
                table => "host",
                column => "company_id",
                value => $user->{company_id}
            }
        ],
        order => [ asc => "hostname" ]
    );

    return %select;
}

1;
